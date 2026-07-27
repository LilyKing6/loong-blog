# loong-blog

A blog and documentation site built on top of [loong-server](https://github.com/LilyKing6/loong-server).

## Setup

```bash
git clone https://github.com/LilyKing6/loong-server.git ../loong-server
```

Then build and run:

```bash
loc build --manifest loong.toml --target blog
lort blog.lx serve -p 8080 -r '*/>{SOURCE}index.html' -R site
```

## Targets

| Target | Description | Build |
|--------|-------------|-------|
| `webdemo` | Demo server (health, echo, login, upload) | `loc build --target webdemo` |
| `blog` | Blog backend (CRUD, drafts, categories, tags, comments, search, revisions) | `loc build --target blog` |
| `docs` | Docs backend (pages, versions, navigation, render, search) | `loc build --target docs` |

## Project structure

```
src/
  blog/       Blog application
  docs/       Documentation site
  webdemo/    Demo entrypoint
site/         Static assets (HTML, CSS)
```

## API

Full route reference: see [API routes](https://github.com/LilyKing6/loong-server) in loong-server docs.

## License

MIT
