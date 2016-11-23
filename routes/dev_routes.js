module.exports = function(app) {
  app.get('/view-debug/*', function(req, res) {
    const path = req.path.substr('/view-debug/'.length);
    if (path === '') {
      res.render('tools/view-debug');
    } else {
      res.render(`${path}`, JSON.parse(req.query.params));
    }
  });
}
