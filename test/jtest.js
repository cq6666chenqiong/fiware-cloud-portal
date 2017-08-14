var Promise = require('bluebird');
const assign = require('object-assign');
var params = assign({
            Region: "jjj",
            Action: 'DescribeKeyPairs',
            Version:'2017-03-12',
            KeyIds:"ddddd"
        },{a:"a",b:"b"});
// console.log(params);
function k(){
    var c = new Promise(function(resolve, reject){
    resolve("abc");
    });
    return c;
}


var m = ["1","2","3"];
Promise.map(m,function(item){

    return k();
}).then(function(data){
    console.log(JSON.stringify(data));
    return data;
});
if("1" in m){
    console.log("ssss");
}

//console.log(JSON.stringify(l));