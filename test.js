const { Fooler } = require('fooler-core');
const Session = require('fooler-session');
const app = Fooler.create({
    p: 8080,
    processes: 1,

    "session": {
        "port": 6379,
        "host": "127.1.0.1",
        "options": {}
    }
});


app.route.GET(/^.*/)
    .then(Session)
    .then(async ({ ctx }) => {
        let data = await ctx.session.get();
        ctx.session.set('times', (data.times || 0) + 1);
        ctx.sendJSON(data)
    });
app.run();