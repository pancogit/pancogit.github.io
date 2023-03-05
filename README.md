# My portfolio website

Portfolio website is personal repository which shows skills, interests and work. It is unique place to share passion about development and programming to the world. There are so many great developers and it's always pleasure to see new ones with ambition, hard work and dedication. Let's build great software and enjoy the process!

## The project

The following project are using React with Typescript and SCSS.

### How to run project

To run project, follow these steps:

1. Install all npm libraries and dependencies:

    ```shell
    npm install
    ```

2. Run react application:

    ```shell
    npm start
    ```

3. Open webpage in browser http://localhost:3000/ .

### Available scripts

To see available scripts, look for
[React readme file](./README_React.md).

### GitHub pages

Application is hosted on [GitHub pages](https://pancogit.github.io/).

To deploy react app on GitHub Pages, build the app for production to the `build` folder. Run the following command:

```shell
npm run deploy
```

It will first call automatically predeploy script (_npm run build_) from _package.json_ file to create `build` folder for production and then it will run _npm run deploy_ which will deploy build code from `build` folder to the **gh-pages** branch of the repository.
