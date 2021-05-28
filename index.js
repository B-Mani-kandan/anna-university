if(process.env.NODE_ENV !=='production')
{
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const MongoDBStore=require('connect-mongo');
const colledge = require('./models/colledge')

const User = require('./models/user');
const { isLoggedIn, isAuthor,isReviewAuthor,validateReview} = require('./middleware');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const Review = require('./models/review')
const multer  = require('multer');
const { storage,cloudinary} = require('./couldinary/index');
const upload = multer({ storage })
const Qus=require('./models/question');
const Ans=require('./models/answer');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const localdb = 'mongodb://localhost:27017/anna'//
const Dburl=process.env.MONGO_URL

mongoose.connect(Dburl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));



app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

const secret = process.env.SECRET

const store = {
    mongoUrl:Dburl,
    secret,
    touchAfter:24*60*60
}

const sessionConfig = {
    name:'con_',
    store:MongoDBStore.create(store),
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());



const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://pro.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://kit.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://pro.fontawesome.com/",
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dby81kbwb/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/',async(req,res)=>{
    const colledges=await colledge.find({})   
    res.render('index.ejs',{colledges})
})

app.get('/colledge',async(req,res)=>{
    const colledges=await colledge.find({})
    res.render('home.ejs',{colledges})
})

app.get('/new',isLoggedIn, async(req,res)=>{
    res.render('new.ejs')
})

app.post('/new',isLoggedIn,upload.array('img'), catchAsync(async(req,res)=>{
    const jform = req.body.jform
    jform.img=req.files.map(f=>({
        url:f.path,
        filename:f.filename
    }))
    
    jform.author = req.user._id;
    

   let a =  {
        type: 'point',
        coordinates:  [Number(req.body.jform.Longitude),Number(req.body.jform.Latitude)]
    }
    
    jform.geometry=a
    
    const jForm = new colledge({...jform})
    jForm.save()
    res.redirect('/colledge');
}))


app.get('/colledge/:id',async(req,res)=>{
    const clg = await colledge.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    .populate({
        path:'question',
        populate:{
            path:'author',
        }
    })
    let star =[];
    for(let re of clg.reviews){
        star.push(re.rating);
    }
    var total = 0;
    for(let i = 0; i < star.length; i++) {
    total += star[i];
    }
    var avg = total / star.length;
   let avgrating = avg.toFixed(1)
   if (star.length === 0) avgrating = 'Not yet to be rated';
   let totalRating = star.length;
    res.render('show', { clg ,avgrating,totalRating});
})

app.get('/colledge/:id/question/:qid',async(req,res)=>{
    const {qid} = req.params;
    const qn = await Qus.findById(qid)
    .populate('answer').populate('author').populate({
        path:'answer',
        populate:{
            path:'author'
        }
    })
    const clg = await colledge.findById(req.params.id);
    res.render('questionpage.ejs',{qn,clg})
})


app.get('/colledge/:id/edit',isLoggedIn,isAuthor, async(req,res)=>{
    const clg = await colledge.findById(req.params.id);
    res.render('edit', {clg});
})


app.put('/colledge/:id',isLoggedIn,isAuthor,upload.array('img'),catchAsync(async(req,res)=>{
    const { id } =req.params
    const clg = await colledge.findByIdAndUpdate(id, { ...req.body.jform });
    const imgs=req.files.map(f=>({
        url:f.path,
        filename:f.filename
    }))
    clg.img.push(...imgs)
    await clg.save()
    if(req.body.deleteImages){
     for(let filename of req.body.deleteImages){
        await cloudinary.uploader.destroy(filename);
     }
     await clg.updateOne({$pull:{img:{filename:{$in:req.body.deleteImages}}}})
    }
    res.redirect(`/colledge/${clg._id}`)
}))

// colledge.findByIdAndDelete('60a8df7bd92ef05a88bc8c7a')

app.delete('/colledge/:id',isLoggedIn,isAuthor, catchAsync(async(req,res)=>{
    const { id } = req.params;
    const clg = await colledge.findByIdAndDelete(id);
    for(let filename of clg.img){
        await cloudinary.uploader.destroy(filename);
     }
    res.redirect(`/colledge`)
}))

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/login',passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),(req,res)=>{
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/colledge';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})


app.get('/create',(req,res)=>{
    res.render('create')
})

app.post('/create', catchAsync(async(req,res)=>{
    try {
        const { email, username, password,name } = req.body.user;
        const user = new User({ email, username,name });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/colledge');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('create');
    }
}))

app.post('/colledge/:id/reviews',isLoggedIn,validateReview,catchAsync(async(req,res)=>{
    const clg = await colledge.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    clg.reviews.push(review);
    await review.save();
    await clg.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/colledge/${clg._id}`);
}))

app.post('/colledge/:cid/answer/:qId',isLoggedIn,catchAsync(async(req,res)=>{
    const qn = await Qus.findById(req.params.qId);
    const clg = await colledge.findById(req.params.cid);
    const an = new Ans(req.body);
    an.author=req.user._id;
    qn.answer.push(an);
    await qn.save();
    await an.save();
    res.redirect(`/colledge/${clg._id}/question/${qn._id}`)
}))

app.post('/colledge/:id/question',isLoggedIn,catchAsync(async(req,res)=>{
    const clg = await colledge.findById(req.params.id);
    const qns = new Qus(req.body.question);
    qns.author = req.user._id;
    clg.question.push(qns);
    await qns.save();
    await clg.save();
    req.flash('success', 'queston created');
    res.redirect(`/colledge/${clg._id}`);
}))



app.delete('/colledge/:id/reviews/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async(req,res)=>{
    const { id, reviewId } = req.params;
    await colledge.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/colledge/${id}`);
}))

app.delete('/colledge/:cid/question/:qid',isLoggedIn,catchAsync(async(req,res)=>{
    const {cid,qid} = req.params;
    await colledge.findByIdAndUpdate(cid, { $pull: { question: qid } });
    await Qus.findByIdAndDelete(qid);
    req.flash('sucess','sucessfully deleted')
    res.redirect(`/colledge/${cid}`);
}))

app.delete('/colledge/:cid/question/:aid/:qid',isLoggedIn,catchAsync(async(req,res)=>{
    const {cid,aid,qid} = req.params;
    console.log(req.parms)
    await Qus.findByIdAndUpdate(qid,{$pull:{answer:aid}});
    await Ans.findByIdAndDelete(aid);
    req.flash('sucess','sucessfully deleted')
    res.redirect(`/colledge/${cid}/question/${qid}`);
}))


app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/colledge');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000

app.listen(port,()=>{
    console.log('app is listening')
})