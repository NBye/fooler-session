const ObjectId = require('./ObjectId');
const Redis = require('fooler-redis');
const session_key = 'fooler_session_id';

const getData = function (data, key) {
    key && key.split('.').forEach(k => {
        if (typeof data == 'object' && data[k] != 'undefined') {
            data = data[k];
        }
    });
    return data;
}
const setData = function (data, key, val) {
    let obj = data, path = [], keys = key.split('.');
    while (keys.length) {
        let key = keys.shift();
        if (typeof obj !== 'object') {
            throw new Error(`data(${JSON.stringify(data)}) path(${path.join('.')}) Is Not Object !`);
        } else if (obj[key] == undefined) {
            obj[key] = {};
        }
        keys.length ? (obj = obj[key]) : (obj[key] = val);
        path.push(key);
    };
    return data;
}

class Session {
    data = null;
    constructor(session_id, options) {
        this.session_id = session_id;
        this.options = options;
    }
    async set(key, value) {
        let redis = await this.db();
        this.data || await this.get();
        setData(this.data, key, value);
        await redis.set(this.session_id, JSON.stringify(this.data)).then(() => {
            redis.expire(this.session_id, 3600 * 4);
        });
    }
    async get(key) {
        let redis = await this.db();
        let data = await redis.get(this.session_id);
        this.data = JSON.parse(data || '{}');
        return getData(this.data, key);
    }
    async db() {
        return await Redis.connect(this.options);
    }
}
module.exports = async function ({ ctx, options }) {
    let session_id = ctx.cookie.get(session_key);
    if (!session_id) {
        session_id = 'session_' + ObjectId().toString();
    }
    //每次请求都延长session 时间
    ctx.cookie.set(session_key, session_id, {
        'max-age': 3600 * 4,
    });
    ctx.session = new Session(session_id, options.session);
    //测试sesion计数器
    // let aaa = await ctx.session.get('aaa');
    // console.log('session aaa:', aaa);
    // ctx.session.set('aaa', Date.now());
};