# Spark users / roles and permissions system

## Users

Each user has a corresponding row in users table.

## Roles

In user table, each user has a "roles" columns. This column can contain comma-separated list of roles.

A role is just a string which is common to both the roles column and can be checked in the app from routes or views.

We user the [connect-roles](https://github.com/ForbesLindesay/connect-roles) module.
Check out their documentation for more details.

### Limitting routes to specific roles

```
app.get('/foo/bar', userRole.isLoggedIn(), function(req, res) {
    // only logged-in users will reach this code
});

app.get('/foo/bar', userRole.isAdmin(), function(req, res) {
    // only admin users will reach this code
});

app.get('/foo/bar', userRole.is('camp manager'), function(req, res) {
    // only camp managers will reach this code
});
```

### Using roles from Jade templates

```
if userIs('logged in')
  h6 user has logged in role

if userIs('admin')
  h6 user has admin role

if userIs('camp manager')
  h6 user has camp manager role
```
