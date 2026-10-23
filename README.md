# Stuff

Babbage Filesystem Explorer

A staging deployment of the master branch of this repository is at [staging-stuff.babbage.systems](https://staging-stuff.babbage.systems).

A live deployment of the production branch of this repository is at [stuff.babbage.systems](https://stuff.babbage.systems).

## Development Instructions

Clone the repo, then run `npm i` to install packages.

To start the live development server on `localhost:8080`, run `npm run start`.

Your browser should automatically open, and your changes should be reflected on-screen whenever you reload.

## License

The license for the code in this repository is the Open BSV License.


## October2026 Node build security maintenance

Build tooling uses Node22.23.4 with the retained frozen dependency lock and
historical peer resolution. Hosted PR CI verifies native Node/Brotli and the
retained source build with bounded registry requests. Application dependency
versions and browser contracts remain unchanged. Obsolete Cloud Run automation
is archived at `docs/legacy-cloud-run-deploy.yaml.txt` and cannot run. A successful
build does not establish application or production-restoration acceptance.
