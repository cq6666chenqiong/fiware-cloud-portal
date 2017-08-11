var config = {};

config.process_user = '';
config.process_group = '';

// nav bar portals
config.fiportals = {
    // Mandatory portals
    'Cloud': 'http://124.251.62.216',
    'Account': 'http://124.251.62.217:8000',
    'Help&info': 'http://124.251.62.216'
    // Another portals
    //,'': ''
};

// Mandatory. TCP port to bind the server to
config.http_port = 8000;

// Set this var to undefined if you don't want the server to listen on HTTPS
config.https = {
    enabled: false,
    cert_file: 'ssl/cert.pem',
    key_file: 'ssl/key.pem',
    port: 443
};

config.useIDM = true;

// OAuth configuration. Only set this configuration if useIDM is true.
config.oauth = {
    account_server: 'http://192.168.87.152:8000',
    client_id: 'f6f1e9bda1144b5185539672c09c5541',
    client_secret: '10b12a87af2b4e0890a10d19d8b6bb11',
    callbackURL: 'http://192.168.87.154:8000/login'
};

config.productAdminOauth = {
    client_id: '9c9bca6d26234ff98fb93df3e3d065c5',
    client_secret: 'e1396a545ace426a941c0edfd3403d0f',
    username:'laoguo.cn@gmail.com',
    password:'12345',
    grant_type : 'password'
};

// Keystone configuration.
config.keystone = {
    version: 3,
    host: '192.168.87.152',
    port: '5000',
    admin_host: '192.168.87.152',
    admin_port: '35357',
    username: '21192900@qq.com',
    password: 'qaz123',
    tenantId: '',

};

//qcloud account
config.qcloud = {
        SecretId: 'AKID2sYy826AMHzTjoMHemobCcXHm47vLoul',
        SecretKey: 'mLjxwgDVebNtEKEvPeePuBCxTjlopfGg',
};

config.delivery  = {
        baseUrl:'http://192.168.87.1:3002'
}

config.qcloud.projectId = '1057374'; //for create keypair

config.qcloud.region = {
    '北京':'ap-beijing',
    '上海':'ap-shanghai',
    '广州':'ap-guangzhou',
    '深圳':'ap-shenzhen'
}

config.time_stats_logger = false;

// Number of cores to use
// If set to 0 or to a higher number than the max available, it uses all of them.
config.max_cores = 1;

module.exports = config;
