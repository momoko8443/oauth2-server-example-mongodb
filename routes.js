const oauthMiddlewares = require('./oauthServerMiddlewares');
const usersController = require('./controllers/users');
const clientsController = require('./controllers/clients');
const util = require('util');

function initialize(app) {
  app.all('/oauth/token', oauthMiddlewares.token);

  app.get('/oauth/authorize', function(req, res, next){
    if(!req.session.user){
      req.session.login = {
        response_type:req.query.response_type,
        client_id:req.query.client_id,
        redirect_uri:req.query.redirect_uri,
        state:req.query.state
      }
      res.redirect(util.format('/login.html'));
      //res.redirect(util.format('/login.html?response_type=%s&client_id=%s&redirect_uri=%s&state=%s',req.query.response_type,req.query.client_id,req.query.redirect_uri,req.query.state));
    }else{
      next();
    }
  },oauthMiddlewares.authorize);

  app.post('/oauth/authorize', function(req, res,next){
    Object.assign(req.body, req.session.login);
    console.log(req.body);
    next();
  },oauthMiddlewares.authorize);

  app.get('/secure', oauthMiddlewares.authenticate, (req, res) => {
    res.json({ message: 'Secure data' });
  });

  app.post('/users', usersController.createUser);

  app.post('/clients', clientsController.createClient);
  app.get('/clients', clientsController.getClient);
}

module.exports = initialize;
