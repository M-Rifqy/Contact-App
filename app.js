const express = require('express');
var expressLayouts = require('express-ejs-layouts');
const {
  loadContact,
  findContact,
  addContact,
  checkDuplicate,
  deleteContact,
  updateContacts,
} = require('./utils/contacts');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(expressLayouts); // Third-party middleware
app.use(express.static('public')); // Built-in middleware
app.use(express.urlencoded({ extended: true })); // parsing data

// Flash message configuration
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 600 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get('/', (req, res) => {
  const mahasiswa = [
    {
      name: 'Muhammad Rifqy',
      email: '2ndrifqy@gmail.com',
    },
    {
      name: 'Amir',
      email: 'amiry@gmail.com',
    },
    {
      name: 'Anthony',
      email: 'anthny@gmail.com',
    },
  ];
  res.render('index', {
    nama: 'Muhammad Rifqy',
    title: 'Home Page',
    mahasiswa,
    layout: 'layouts/main-layout',
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    layout: 'layouts/main-layout',
    title: 'About Page',
  });
});

app.get('/contact', (req, res) => {
  const contacts = loadContact();
  res.render('contact', {
    layout: 'layouts/main-layout',
    title: 'Contact Page',
    contacts,
    msg: req.flash('msg'),
  });
});

// Add new contact
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Entry Data Page',
    layout: 'layouts/main-layout',
  });
});

// Add new contact process
app.post(
  '/contact',
  [
    body('phone').custom((value) => {
      const duplicate = checkDupilcate(value);
      if (duplicate) {
        throw new Error('This contact is already in use, use another contact');
      }
      return true;
    }),
    check('email', 'Invalid email').isEmail(),
    check('phone', 'Invalid phone number').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', {
        title: 'Entry Data Form',
        layout: 'layouts/main-layout',
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      // Send flash message
      req.flash('msg', 'Contact data added successfully!');
      res.redirect('/contact');
    }
  }
);

// Delete contact
app.get('/contact/delete/:phone', (req, res) => {
  const contact = findContact(req.params.phone);

  if (!contact) {
    res.status(404);
    res.send('<h1>404</h1>');
  } else {
    deleteContact(req.params.phone);
    req.flash('msg', 'Contact data deleted successfully!');
    res.redirect('/contact');
  }
});

// Edit contact
app.get('/contact/edit/:phone', (req, res) => {
  const contact = findContact(req.params.phone);

  res.render('edit-contact', {
    title: 'Edit Contact Page',
    layout: 'layouts/main-layout',
    contact,
  });
});

// Edit contact process
app.post(
  '/contact/update',
  [
    body('phone').custom((value, { req }) => {
      const duplicate = checkDuplicate(value);
      if (value !== req.body.oldPhone && duplicate) {
        throw new Error('This contact is already in use, use another contact');
      }
      return true;
    }),
    check('email', 'Invalid email').isEmail(),
    check('phone', 'Invalid phone number').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('edit-contact', {
        title: 'Edit Contact Form',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      // Send flash message
      req.flash('msg', 'Contact data updated successfully!');
      res.redirect('/contact');
    }
  }
);

// Contact detail page
app.get('/contact/:phone', (req, res) => {
  const contact = findContact(req.params.phone);

  res.render('detail', {
    layout: 'layouts/main-layout',
    title: 'Contact Detail Page',
    contact,
  });
});

app.use((req, res) => {
  res.status(404);
  res.send('<h1>404</h1>');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
