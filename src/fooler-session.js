const ObjectId = require('./ObjectId');
const Redis = require('fooler-redis');

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
        redis.set(this.session_id, JSON.stringify(this.data)).then(() => {
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
        return Redis.connect(this.options);
    }
}
module.exports = async function ({ ctx, conf }) {
    let session_id = ctx.cookie.get('token');
    if (!session_id) {
        session_id = ObjectId().toString();
    }
    //每次请求都延长session 时间
    ctx.cookie.set('token', session_id, {
        'max-age': 3600 * 4,
    });
    ctx.session = new Session(session_id, conf.session);

    //测试sesion计数器
    // let aaa = await ctx.session.get('aaa');
    // console.log('session aaa:', aaa);
    // ctx.session.set('aaa', Date.now());
};