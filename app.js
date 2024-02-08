const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const connection = require("./database/database.js");
const session = require('express-session');

const CategoriesController= require("./categories/CategoriesController");
const ArticleController = require("./articles/ArticleController.js")
const UsersController = require("./user/UsersController");

const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./user/User");




// view engine 
app.set('view engine','ejs');

// configurar sessions
app.use(session({
    secret: "qualquercoisabemaleatoria", cookie: {maxAge: 30000000000}
}));
// redis melhor que esse de cima

// static
app.use(express.static('public'));

// body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// database

connection
    .authenticate()
    .then(() => {
        console.log("Conexao feita com sucesso!");
    }).catch((error) => {
        console.log(error);
    })

// router
app.use("/", CategoriesController);
app.use("/", ArticleController);
app.use("/", UsersController);

app.get("/sessinon", (req,res)=>{
    req.session.treinamento= "Formação Node.js"
    req.session.ano= 2024
    req.session.email="denis@email.com"
    req.session.user= {
        username:"DenisMunerolli",
        email: "email@email.com",
        id: 10
    }
    res.send("Sessão gerada!")
});

app.get("/leitura", (req,res)=>{
    res.json({
        treinamento: req.session.treinamento,
        ano: req.session.ano,
        email: req.session.email,
        user: req.session.user
    })
});

app.get("/", (req, res)=> {
    Article.findAll({
        order:[
            ['id','desc']
        ],
        limit: 4
    }).then(articles =>{
        Category.findAll().then(categories =>{
            res.render("index", {articles: articles, categories: categories});
        })
    });
});

app.get("/:slug", (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("article", {articles: article, categories: categories});
            });
        }else{
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    });
});

app.get("/category/:slug",(req,res) =>{
    var slug =req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include:[{model: Article}]
    }).then(category => {
        if(category != undefined){
            Category.findAll().then(categories =>{
                res.render("index",{articles: category.articles, categories: categories})
            });
        }else{
            res.redirect("/");
        }
    }).catch(err =>{
        res.redirect("/");
    })
});

app.listen(8080, ()=> {
    console.log("O servidor esta rodando");
});

