# Apostrophe CLI

The Apostrophe CLI is a cross-platform starting point for creating and configuring [ApostropheCMS](https://github.com/apostrophecms/apostrophe) projects, providing a simple boilerplate generator and wrapping other useful functions into an easy to use command line tool.

**Requires Node.js 8+**

First, install `@apostrophecms/cli` as a global NPM module:

```bash
npm install -g @apostrophecms/cli
```

To view the available commands in a given context, execute the `apos` command with no arguments:

```bash
apos
```

**Note:** All Apostrophe CLI commands can also be run with `apostrophe`, the legacy command, in addition to `apos`.

## Create a project

To create a new project with the tool:
```bash
apos create <shortname-without-spaces>
```

This will create a local copy of the [Apostrophe 3 boilerplate](https://github.com/apostrophecms/a3-boilerplate).

### options

#### `--a2`

Use the `--a2` flag when creating an Apostrophe 2 project to use [the boilerplate](http://github.com/apostrophecms/apostrophe-boilerplate) for that version.

#### `--starter`

Run `create` with a `--starter` flag to start from a Github repository other than the standard starters. For example, `apos create <shortname-without-spaces> --starter=https://github.com/apostrophecms/apostrophe-open-museum.git` would create a project using the [Open Museum](https://github.com/apostrophecms/apostrophe-open-museum) demo.

## Create a widget
To bootstrap the necessary files and basic configuration for a new Apostrophe widget, run the following command from within your Apostrophe project's root directory:
```bash
# "-widgets" will automatically be appended to the end of your module name
apos add widget fancy-button
```

**Note:** You will then need to register this widget module in `app.js` so it is available in your project code. The same is true for the commands below when you create a piece module or generic module.

```javascript
// app.js
module.exports = {
  // ...
  'fancy-button-widgets': {},
  // ...
}
```

Add a `--player` option to the command to include the client-side Javascript "player" boilerplate to the new widget module as well.

```bash
apos add widget tabs --player
```

## Create a piece
To bootstrap the necessary files and basic configuration for a new Apostrophe piece type, run the following command from within your Apostrophe project's root directory:

```bash
apos add piece vegetable
```

Then remember to register `'vegetable': {}` in `app.js` above.

If you run the `add piece` command with the `--page` flag, the command will also set up a corresponding piece-pages module with your new piece type. Similarly, you can run the `add piece` command with the `--widget` flag, which will also set up a corresponding piece-widgets module along with your new piece type. These flags can be used together or separately.

```bash
apos add piece vegetable --page --widget
```

## Create an empty Apostrophe module
To bootstrap the necessary files and basic configuration for a brand-new Apostrophe module that doesn't extend one of the usual suspects like pieces or widgets:
```bash
apos add module <module name>
```

Remember to register the module in `app.js` with the other module types.

---------------

For more documentation for ApostropheCMS, visit the [documentation site](https://docs.apostrophecms.org).

## Deploying Apostrophe

In the long run, everyone wants their project to be live. The Apostrophe CLI includes simple commands for deploying your Apostrophe project from your development machine to any server running Ubuntu 20.04 Linux — such as an Amazon Lightsail or EC2 instance, Digital Ocean droplet, a Linode instance, or even a physical server in an office.

Your deployment automatically includes everything Apostrophe needs to run reliably at single-server scale: MongoDB, Node.js, Imagemagick and the pm2 process manager. For larger scales and multisite projects, [check out Apostrophe Assembly](https://apostrophecms.com/assembly).

> ApostropheCMS is open source and can be deployed to almost any Linux environment. We provide Ubuntu 20.04 deployment tools in the CLI as a convenience, but don't let that stop you from going anywhere you'd like to go.

### Deploying your project for the first time

First obtain an Ubuntu 20.04 server from Digital Ocean, Linode, Amazon Lightsail or anywhere you like. Make sure you have ssh access and the IP address. Since your site will have a database and you'll be uploading media, for best results your server should have at least 2GB of RAM and 20GB of disk space.

Now type:

```
apos deploy production
```

Since you haven't set it up before, the CLI will prompt you for the IP address of your first server, and then prompt for credentials as needed. After your first deployment, this will be much faster.

At the end of the process, you'll receive a temporary URL with an IP address to access your site. To use a real hostname, **first add a DNS "A" record pointing to your server's IP address.** Then type:

```
apos deploy production set --host=example.com --alias=www.example.com
```

> Use your real, registered domain name, not `example.com`. Apostrophe will remember your site's main hostname and aliases. You don't have to type them every time you deploy.

Apostrophe will confirm a new URL for you. It'll be an `http:` URL at first, but you can install [`certbot`](https://certbot.eff.org/) on your server to enable `https:`.

### Deploying your project after an update

After updating and testing your code locally, just deploy again:

```
apos deploy production
```

Your project will automatically update on the server.

### Opening a shell for your deployment

To run Apostrophe command line tasks or view the logs with `pm2 logs`, type:

```
apos deploy production shell
```

An interactive shell will open on the server and the current working directory will be your project. Press control-D when you're done.

You can also run a single command without opening an interactive shell:

```
# Set up your first admin user with your password of choice
echo "password" | apos deploy production shell node app @apostrophecms/user:add admin admin
# View server logs
apos deploy production shell pm2 logs
```

### Syncing content

#### Syncing TO the server

When a project is new, sometimes you'll want to replace all of the content with what's on your development machine:

```
apos deploy production content push
```

> This erases all the live content for this deployment on the server, so you will be prompted to confirm.

#### Syncing FROM the server

From time to time you'll want to replace the content on your development machine with a copy of what's on the server, for better testing:

```
apos deploy production content pull
```

> If you need to sync content between two environments on a server, right now the easiest way is to `content pull` from one and then `content push` to the other.

### Deploying to separate staging and production environments

You can deploy to separate environments easily. A staging server is great to have for trying out code changes with other people:

```
apos deploy staging
```

Since you have a server, you'll be asked if you want to reuse it or add another one. It's OK to host staging and production on a single server for small projects.

### Deploying multiple projects

You can deploy as many projects as you want. Just run `apos deploy` from the appropriate project folder. Again, you'll be asked if you want to reuse one of your existing servers or add another one.

### Removing a deployment from a server

To remove a deployment, type:

```
apos deploy production delete
```

> This will completely delete the production deployment from your server, including all of your content and media! If that isn't what you want, don't use this command.

### "Forgetting" a deployment

If a server no longer exists or you have manually removed a deployment from it, you can't "remove" the deployment because it can't be reached. Instead, just "forget" the deployment:

```
apos deploy production forget
```

If you forget the last deployment on a server it will disappear from the list.

### Listing your deployments

To list all of your deployments for this project:

```
apos deploy
```

This command will list any deployments that do exist, along with instructions for deploying.

### Frequently Asked Questions

#### Should I deploy to an existing Ubuntu server that runs other stuff?

You can, and our deployment commands will do their best to stay out of the way, but we can't guarantee zero conflict with every possible setup.

#### Should I deploy several projects to the same server?

Absolutely! Just bear in mind it's not intended to insulate projects from each other. If you wrote them all, that shouldn't be a problem.

#### Can I deploy "staging" and "production" of the same project to the same server?

Sure can. However, to guarantee no interaction between them, you might use separate servers.

### Deploying at scale

The built-in deployment system included in the CLI is great for single-server deployments, which meet the needs of smaller and medium-sized projects. If your needs call for multisite deployments and/or multiserver scalability, availability and durability, [reach out to us about Apostrophe Assembly, our professional multisite hosting platform.](https://apostrophecms.com/assembly). We'd be happy to give you a demo.
