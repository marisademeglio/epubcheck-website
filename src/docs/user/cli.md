---
title: Command Line Interface
---

EPUBCheck is a command line tool, all detected errors are simply printed to `stderr` output stream.

There's no native GUI – however, there are some third-party apps offering a GUI. See the [Third Party Tools](../third-party-tools) for further details.

## Running from the command line

### Overview of command line arguments

Print the command line help with the `--help` argument:

```
$ java -jar epubcheck.jar --help

EPUBCheck v4.0.2

When running this tool, the first argument should be the name (with the path)
of the file to check.

To specify a validation profile (to run checks against a specific EPUB 3 profile
or extension specification), use the -profile option:

Validation profiles supported:
--profile default // the default validation profile
--profile dict    // validates against the EPUB Dictionaries and Glossaries specification
--profile edupub  // validates against the EDUPUB Profile
--profile idx     // validates against the EPUB Indexes specification
--profile preview // validates against the EPUB Previews specification

If checking a non-epub file, the epub version of the file must
be specified using -v and the type of the file using -mode.
The default version is: 3.0.

Modes and versions supported: 
--mode opf -v 2.0
--mode opf -v 3.0
--mode xhtml -v 2.0
--mode xhtml -v 3.0
--mode svg -v 2.0
--mode svg -v 3.0
--mode nav -v 3.0
--mode mo  -v 3.0 // For Media Overlays validation
--mode exp  // For expanded EPUB archives

This tool also accepts the following options:
--save 	       = saves the epub created from the expanded epub
--out <file>     = output an assessment XML document file (use - to output to console)
--xmp <file>     = output an assessment XMP document file (use - to output to console)
--json <file>    = output an assessment JSON document file (use - to output to console)
-m <file>        = same as --mode
-p <profile>     = same as --profile
-o <file>        = same as --out
-x <file>        = same as --xmp
-j <file>        = same as --json
--failonwarnings[+|-] = By default, the tool returns a 1 if errors are found in the file or 0 if no errors
                        are found.  Using --failonwarnings will cause the process to exit with a status of
                        1 if either warnings or errors are present and 0 only when there are no errors or warnings.
-q, --quiet      = no message on console, except errors, only in the output
-f, --fatal      = include only fatal errors in the output
-e, --error      = include only error and fatal severity messages in ouput
-w, --warn       = include fatal, error, and warn severity messages in output
-u, --usage      = include ePub feature usage information in output
                    (default is OFF); if enabled, usage information will
                    always be included in the output file

-l, --listChecks [<file>] = list message ids and severity levels to the custom message file named <file>
                          or the console
-c, --customMessages [<file>] = override message severity levels as defined in the custom message file named <file>

-h, -? or --help = displays this help message

No file specified in the arguments. Exiting.
epubcheck completed
```

## Usage guide

Here are some examples of typical use cases of EPUBcheck, to know all the possibilities offered by the tool refer to [overview of command line arguments](#overview-of-command-line-arguments).

### Validating a packaged EPUB

```
java -jar epubcheck.jar file.epub
```

### Specifying a validation profile

It is possible to specify a validation profile to validate an EPUB (or single file thereof) against a specific EPUB specification.

```
java -jar epubcheck.jar file.epub -profile PROFILE
```

Current profiles include:

* **`default`**: the default validation profile
* **`dict`**: validates against the [EPUB Dictionaries and Glossaries](http://www.idpf.org/epub/dict/epub-dict.html) specification
* **`edupub`**: validates against the [EDUPUB Profile](http://www.idpf.org/epub/profiles/edu/spec/)
* **`idx`**: validates against the [EPUB Indexes](http://www.idpf.org/epub/idx/epub-indexes.html) specification
* **`preview`**: validates against the [EPUB Previews](http://www.idpf.org/epub/previews/) specification

**Note:**
> In most cases, it is not required to specify the validation profile explicitly, as it will automatically be set according to `dc:type` metadata in the Publication. Setting the profile explicitly can be useful to detect when such `dc:type` metadata is missing, or to validate single files (see next section).

### Validating a single file

In addition to validating complete EPUB packages (compressed or expanded) you can validate individual files contained in an EPUB.

```
java -jar epubcheck.jar singleFile -mode MODE -v VERSION -profile PROFILE
```

 * **MODE** must be one of the following:
  * **`opf`** for package document validation;
  * **`nav`** for navigation document validation (available only for version 3.0);
  * **`mo`** for media overlay validation (available only for version 3.0);
  * **`xhtml`**;
  * **`svg`**;
  * _**`exp`** for Expanded EPUB validation (see the next section)_

 * **VERSION** must be one of
  * `2.0` for EPUB 2
  * `3.0` for EPUB 3

 * **PROFILE** is optional (see the previous section).

**Note:**
> When validating a single file, only a subset of the available tests is run. Also, when validating a full EPUB, both mode and version are ignored._

### Validating an "expanded" (i.e. unzipped) EPUB

```
java -jar epubcheck.jar folder/ -mode exp [-save]
```

When using expanded mode, there's an optional flag `-save` to save the created archive upon validation.

### Getting validation output in a structured format

By default the output of EPUBcheck validation is returned to the console in textual format, but you can get the result in a structured format, so it can be processed by other software.

The available formats are:

- XML: using argument `--out` (or `-o`)
- XMP: using argument `--xmp` (or `-x`)
- JSON: using argument `--json` (or `-j`)

The output in the specified format can be saved in a file (specifying the path as argument value), or returned to the console (entering `-` as argument value).

Example of saving the output in JSON format to file:

```
java -jar epubcheck.jar --json output.json file.epub
```

Example of output in XML format in the console:

```
java -jar epubcheck.jar --out - file.epub
```

## Troubleshooting

### `File not found` error

If EPUBCheck fails because of Unicode characters in file paths, the following command line parameters can be used:

```
java -Dsun.jnu.encoding=UTF8 -Dfile.encoding=UTF8 -jar epubcheck.jar "Mały Książę - Antoine de Saint-Exupéry.epub"
```

("Mały Książę" = "Le Petit Prince" in Polish)

### `java.lang.StackOverflowError`

If EPUBCheck crashes with a `StackOverflowError`, try adjusting the thread stack size of your Java Virtual Machine. With most Java distributions, this can be done by using the `-Xss` option of the `java` command, like in the following example:

```
java -Xss1024k -jar epubcheck.jar moby-dick.epub
```

