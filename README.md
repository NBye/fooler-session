# fooler-session
1. fooler-session 是一 fooler-core 框架 的session 支持;

### 一、安装使用
1. npm install fooler-session
2. 设置启动配置 session 的 redis 链接配置
3. 路由使用 这个组件

### 二、示例1 在指定路由设置使用session
```javascript
const { Fooler } = require('fooler-core');
const Session = require('fooler-session');
const app = Fooler.create({
    p: 8080,
    processes: 1,

    "session": {            //这个配置时必须的
        "port": 6379,
        "host": "127.1.0.1",
        "options": {}       //如果设置密码 options的值 {"password": "123456","db": 0}
    }
});
app.route.GET(/^.*/)
    .then(Session)          //在置顶路由中使用
    .then(async ({ ctx }) => {
        let data = await ctx.session.get();
        ctx.session.set('times', (data.times || 0) + 1);
        ctx.sendJSON(data)
    });
app.run();
```

### 三、全局设置 session

```javascript
const { Fooler } = require('fooler-core');
const Session = require('fooler-session');
const app = Fooler.create({
    p: 8080,
    processes: 1,

    "session": {            //这个配置时必须的
        "port": 6379,
        "host": "127.1.0.1",
        "options": {}       //如果设置密码 options的值 {"password": "123456","db": 0}
    }
});
app.route.then(Session);    //在顶级路由中设置session
app.route.GET(/^.*/)
    .then(async ({ ctx }) => {
        let data = await ctx.session.get();
        ctx.session.set('times', (data.times || 0) + 1);
        ctx.sendJSON(data)
    });
app.run();
```


### 三、给指定路由组 session

```javascript
const { Fooler } = require('fooler-core');
const Session = require('fooler-session');
const app = Fooler.create({
    p: 8080,
    processes: 1,

    "session": {        //这个配置时必须的
        "port": 6379,
        "host": "127.1.0.1",
        "options": {}   //如果设置密码 options的值 {"password": "123456","db": 0}
    }
});
app.route.when('/my')
    .then(Session)      //给指定路由组 session
    .childen((r)=>{
        r.when('/book/add').then(async ({ ctx }) => {
            let data = await ctx.session.get();
            ctx.session.set('times', (data.times || 0) + 1);
            ctx.sendJSON(data)
        }
        r.when('/book/rem').then(async ({ ctx }) => {
            let data = await ctx.session.get();
            ctx.session.set('times', (data.times || 0) + 1);
            ctx.sendJSON(data)
        }
    });
app.run();
```