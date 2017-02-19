const testlib = module.exports = {};

testlib.getAdminHttpRequest = function() {
    return {
        user: {
            isAdmin: true
        }
    };
};
