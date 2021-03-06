const path = require('path');
const nunjucks = require('nunjucks');
const moment = require("moment");
const util = require('util');
const fs = require('fs-extra');
const site = JSON.parse(fs.readFileSync("src/_data/site.json"));
const versions = JSON.parse(fs.readFileSync("src/_data/versions.json"));
const semverCompare = require('semver/functions/compare');
const uslug = require('uslug')
const uslugify = s => uslug(s)

module.exports = function (eleventyConfig) {
    // restore the backup in case we overwrote it the last time we built the site
    if (fs.existsSync(".eleventyignore.bak")) {
        fs.copyFileSync(".eleventyignore.bak", ".eleventyignore");
    }
    // we want the "latest.js" file to exist only at the top level, because it is the single source of truth for site versioning
    // so, add it to the ignores list if we are writing a version (i.e. to a subfolder)
    if (process.env.DOCSSITE_WRITE_VERSION == 'true') {
        const dynamicIgnores = [`src/latest.njk`, 'src/history'];
        fs.copyFileSync(".eleventyignore", ".eleventyignore.bak");
        let ignore = fs.readFileSync('.eleventyignore');
        ignore += `\n${dynamicIgnores.join('\n')}`;
        fs.writeFileSync(".eleventyignore", ignore);
    }
    
    let templateFormats = [
        "md",
        "njk",
        "html"
    ];

    let nunjucksEnv = new nunjucks.Environment(
        new nunjucks.FileSystemLoader("src/_includes")
    );

    // format values:
    //  "calendar": e.g. "Last updated yesterday 8pm"
    //  or
    //  any moment.js format string, e.g. "YYYY-MM-DD"
    eleventyConfig.addFilter("readableDate", (dateObj, format) => 
        format === "calendar" ? moment(dateObj).calendar()
            .replace("Today", "today")
            .replace("Yesterday", "yesterday")
            : moment(dateObj).format(format)
    );
    
    eleventyConfig.addFilter("head", (array, n) => {
        if (n < 0) {
            return array.slice(n);
        }
        return array.slice(0, n);
    });

    eleventyConfig.addFilter('dump', obj => {
        return util.inspect(obj)
    });

    eleventyConfig.addFilter('sortSemver', list => list.sort((a,b) => semverCompare(a,b)));

    // calculate the path to the site, taking version into account
    let getSitePath = version => {
        let sitePath = '';
        if (version != '') {
            sitePath = `/version/${version}`;
        }
        if (process.env.DOCSSITE_ROOT_SUBDIR != '' && process.env.DOCSSITE_ROOT_SUBDIR != undefined) {
            sitePath = `/${process.env.DOCSSITE_ROOT_SUBDIR}${sitePath}`;
        }
        return sitePath;
    };
    
    // add the path to the versioned subdir for the site to the file
    eleventyConfig.addFilter('addVersionRootPath', file => {
        let sitePath = getSitePath(process.env.DOCSSITE_VERSION);
        return `${sitePath}${file}`;
    });

    // calculate the path to the docs subdir, taking version into account
    eleventyConfig.addFilter('getDocsPath', version => {
        let sitePath = getSitePath(version);
        return `${sitePath}/${site.docsSubdir}`;
    });

    // add the base root path to the file
    eleventyConfig.addFilter('addSiteRootPath', file => 
        `${process.env.DOCSSITE_ROOT_SUBDIR != "" && 
            process.env.DOCSSITE_ROOT_SUBDIR != undefined ? 
            `/${process.env.DOCSSITE_ROOT_SUBDIR}` : ''}${file}`);

    eleventyConfig.setBrowserSyncConfig({
        callbacks: {
         ready: function(err, bs) {
           const content_404 = fs.readFileSync('_site/404.html');
           bs.addMiddleware("*", (req, res) => {
            // Provides the 404 content without redirect.
            res.write(content_404);
            res.end();
          });
         }
        }
      });
    
    eleventyConfig.setLibrary("njk", nunjucksEnv);
    
    let markdownIt = require("markdown-it");
    let markdownItAnchor = require("markdown-it-anchor");
    let options = {
        html: true,
        breaks: true,
        linkify: true
    };
    let opts = {
        permalink: true,
        permalinkClass: "direct-link",
        permalinkSymbol: "§",
        permalinkBefore: true,
        slugify: uslugify
    };

    eleventyConfig.setLibrary("md", markdownIt(options)
        .use(markdownItAnchor, opts)
    );

    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.setDataDeepMerge(true);

    if (process.env.DOCSSITE_WRITE_VERSION) {
        console.log("Writing site to versioned subdirectory");
    }
    else {
        console.log("Writing site to main directory");
    }
    let pathPrefix = process.env.DOCSSITE_WRITE_VERSION === 'true' ? 
        getSitePath(process.env.DOCSSITE_VERSION) : getSitePath('');
    console.log('PATH PREFIX: ', pathPrefix);

    return {
        templateFormats,
        pathPrefix,
        passthroughFileCopy: true,
        dir: {
            input: "src",
            output: `_site/${process.env.DOCSSITE_WRITE_VERSION==='true' ? 
                `version/${process.env.DOCSSITE_VERSION}` : ''}`
        }
    };
};
