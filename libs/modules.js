const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const express = require('express');

const modules = module.exports = {};

var moduleNames = null;

modules.getModuleNames = function() {
    if (!moduleNames) {
        moduleNames = _(fs.readdirSync(path.join(__dirname, '..', 'modules'))).filter(function(moduleName) {
            return fs.existsSync(path.join(__dirname, "..", "modules", moduleName, "README.md"));
        });
    }
    return moduleNames;
};

modules.addPublicPaths = function(app) {
    _(modules.getModuleNames()).each(function(moduleName) {
        var publicPath = path.join(__dirname, "..", "modules", moduleName, "public");
        if (fs.existsSync(publicPath)) {
            app.use("/modules/"+moduleName+"/public", express.static(publicPath));
        }
    });
};

modules.getViewPaths = function() {
    return _(modules.getModuleNames()).map(function(moduleName) {
        var viewsPath = path.join(__dirname, "..", "modules", moduleName, "views");
        if (fs.existsSync(viewsPath)) {
            return viewsPath;
        } else {
            return null;
        }
    }).filter(function(viewsPath) {
        return viewsPath;
    });
};

modules.addRoutes = function(app, passport) {
    _(modules.getModuleNames()).each(function(moduleName) {
        if (fs.existsSync(path.join(__dirname, "..", "modules", moduleName, "routes.js"))) {
            require('../modules/'+moduleName+'/routes')(app, passport);
        }
    });
};

modules.require = function(module, name) {
    if (module === 'core') {
        // core
        return require('../' + name);
    } else {
        // module
        return require('../modules/'+module+'/'+name);
    }
};
