import { abi, contractAdd } from "./abi.js"


// const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545")
// const signer = provider.getSigner()
const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()
const contract = new ethers.Contract(contractAdd, abi, signer)

const connectButton = document.getElementById("connectButton");
const logainpage = document.getElementById("logain");
const tip = document.querySelector(".header .menu")
const main = document.getElementById("market");
const storage = document.getElementById("storage");
var logained = 0;

// 添加点击事件监听器
connectButton.onclick = connect;
main.onclick = (() => {
  const main = document.getElementById("main");
  const mystorage = document.getElementById("mystorage");
  main.remove();
  initmarket();
  main.style.left = "0";
  mystorage.style.left = "-2500px";
});

storage.onclick = (() => {
  const main = document.getElementById("main");
  const mystorage = document.getElementById("mystorage");
  mystorage.remove();
  initstorage();
  const mystorage2 = document.getElementById("mystorage");
  main.style.left = "-2500px";
  mystorage2.style.left = "0";

});

tip.onclick = () => {
  if (!logained)
    alert("请登录！")
}

async function connect() {
  // 检查是否安装 Metamask
  if (typeof window.ethereum !== 'undefined') {
    // 请求用户授权连接钱包
    try {
      // 获取当前账户地址
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      // 更新页面上的地址
      logainpage.remove();
      const addressElement = document.getElementsByClassName("header")[0];
      var newElement = document.createElement('div');
      newElement.setAttribute('class', 'floatright');
      newElement.setAttribute('id', 'address');
      newElement.innerHTML = address;
      addressElement.appendChild(newElement);
      logained = 1;
      initmarket();
      initstorage();
    } catch (error) {
      console.error(error);
    }
  } else {
    alert('请先安装 Metamask！');
  }
}
//初始化商城页面
function initmarket() {
  const addressElement = document.getElementsByClassName("container")[0];
  var newElement = document.createElement('div');
  newElement.setAttribute('id', 'main');
  var newElement1 = document.createElement('div');
  newElement1.setAttribute('id', 'pool');
  newElement1.setAttribute('class', 'clearfloat');
  var newElement2 = document.createElement('div');
  newElement2.setAttribute('id', 'store');
  newElement2.setAttribute('class', 'clearfloat');

  const resultP = contract.getpool();
  const resultS = contract.getstore();
  var pl
  var sl

  //生成盲盒抽奖池
  resultP.then((result) => {
    pl = result[0].length
    for (var i = 0; i < pl; i++) {
      let newcom = document.createElement('div');
      var newdiv1 = document.createElement('div');
      var newdiv2 = document.createElement('div');
      newdiv1.setAttribute('class', 'logo');
      newdiv2.setAttribute('class', 'msg');
      newcom.setAttribute('class', 'goods floatleft pool');
      let newImg = document.createElement('img');
      newImg.setAttribute('src', `../source/999.jpg`);
      newdiv1.appendChild(newImg);
      newcom.appendChild(newdiv1)
      newcom.appendChild(newdiv2)
      newElement1.appendChild(newcom);
    }
    var button = document.createElement('button');
    button.setAttribute('class', 'cj');
    button.innerHTML = "开始抽奖,价格:888"
    newElement1.appendChild(button)
    // 为按钮添加点击事件监听器
    button.addEventListener('click', function () {
      // 获取超链接元素
      const storageLink = document.getElementById('storage');
      if (storageLink) {
        // 获取超链接的 href 属性值
        const targetUrl = storageLink.href;
        // 跳转到对应的 URL
        window.location.href = targetUrl;
      }
    });
  });
  //生成普通商店
  resultS.then((result) => {
    sl = result[0].length
    for (var i = 0; i < sl; i++) {
      let newcom = document.createElement('div');
      var newdiv1 = document.createElement('div');
      var newdiv2 = document.createElement('div');
      newdiv1.setAttribute('class', 'logo');
      newdiv2.setAttribute('class', 'msg');
      newcom.setAttribute('class', 'goods floatleft store');
      let newImg = document.createElement('img');
      contract.getlogo(result[0][i].id._hex)
        .then((result) => {
          let index = Number(result._hex)
          newImg.setAttribute('src', `../source/${index}.jpg`);
        });
      let div1 = document.createElement('div');
      let div2 = document.createElement('div');
      let span = document.createElement('span');
      span.style.display = "none";
      span.innerHTML = result[0][i].id._hex;
      contract.getprice(result[0][i].id._hex)
        .then((result) => {
          let p = Number(result._hex)
          div1.innerHTML = "价 格:" + p
        });
      div2.innerHTML = "战斗力:" + Number(result[0][i].power._hex)
      let newButton = document.createElement('button');
      newButton.setAttribute('class', 'buy');
      newButton.innerHTML = '购 买';
      newdiv1.appendChild(newImg);
      newdiv2.appendChild(div1);
      newdiv2.appendChild(div2);
      newdiv2.appendChild(span);
      newdiv2.appendChild(newButton);
      newcom.appendChild(newdiv1)
      newcom.appendChild(newdiv2)
      newElement2.appendChild(newcom);
    }
  });
  newElement.appendChild(newElement1);
  newElement.appendChild(newElement2);
  addressElement.appendChild(newElement);

  //绑定抽奖事件
  const topool = document.getElementsByClassName("cj")
  setTimeout(() => {
    topool[0].onclick = function () {
      // 手动设定燃气上限
      const gasLimit = ethers.utils.hexlify(200000);
      contract.tran_pool({ gasLimit });
    }
  }, 1000)
  //绑定购买事件
  resultS.then((result) => {
    const tobuy = document.getElementsByClassName("buy")
    setTimeout(() => {
      for (let i = 0; i < tobuy.length; i++) {
        tobuy[i].onclick = function () {
          // 手动设定燃气上限
          const gasLimit = ethers.utils.hexlify(2000000);
          var id = result[0][i].id._hex
          contract.tran_store(id, { gasLimit })
            .then(() => {
              // 购买成功后显示弹窗
              alert('购买成功！');
            })
            .catch((error) => {
              console.error('购买失败:', error);
            });
        }
      }
    }, 1000)
  });
}

//初始化个人仓库页面
function initstorage() {
  const addressElement = document.getElementsByClassName("container")[0];
  var newElement = document.createElement('div');
  newElement.setAttribute('id', 'mystorage');

  var mybalance = document.createElement('div');
  mybalance.setAttribute('class', 'mybalance');
  var newElement1 = document.createElement('div');
  newElement1.setAttribute('class', 'balance floatleft');
  var newElement2 = document.createElement('div');
  newElement2.setAttribute('class', 'stor floatleft');
  var newElement4 = document.createElement('div');
  newElement4.setAttribute('class', 'nums');

  const balance = contract.balanceOf();
  balance.then((result) => {
    newElement1.innerHTML = "余额：" + Number(result._hex)
  });
  const nums = contract.getE7balance();
  nums.then((result) => {
    newElement2.innerHTML = "藏品数量：" + Number(result._hex)
  });


  const result = contract.getstorehouse_ID();
  result.then((result) => {
    for (var i = 0; i < result[0].length; i++) {
      let newcom = document.createElement('div');
      var newdiv1 = document.createElement('div');
      var newdiv2 = document.createElement('div');
      newdiv1.setAttribute('class', 'logo');
      newdiv2.setAttribute('class', 'msg');
      newcom.setAttribute('class', 'mygoods floatleft');
      let newImg = document.createElement('img');

      contract.getlogo(result[0][i]._hex)
        .then((r) => {
          let index = Number(r._hex)
          newImg.setAttribute('src', `../source/${index}.jpg`);
        });

      let div1 = document.createElement('div');
      let div2 = document.createElement('div');
      let div3 = document.createElement('div');

      contract.getprice(result[0][i]._hex)
        .then((result) => {
          let p = Number(result._hex)
          div1.innerHTML = "价 格:" + p
        });
      contract.getstorehouse_A(result[0][i]._hex)
        .then((result) => {
          div2.innerHTML = "战斗力：" + Number(result.power._hex);
        });


      div3.innerHTML = result[0][i]._hex
      div3.setAttribute('class', 'ID');
      let newButton = document.createElement('button');
      let price = document.createElement('input');
      price.setAttribute('class', 'sellprice');
      price.setAttribute('type', 'number');
      newButton.setAttribute('class', 'sell');
      newButton.innerHTML = '出 售';

      newdiv1.appendChild(newImg);
      newdiv2.appendChild(div1);
      newdiv2.appendChild(div2);
      newdiv2.appendChild(div3);
      newdiv2.appendChild(price);
      newdiv2.appendChild(newButton);
      newcom.appendChild(newdiv1)
      newcom.appendChild(newdiv2)
      newElement.appendChild(newcom);
    }
  });

  mybalance.appendChild(newElement1);
  mybalance.appendChild(newElement2);
  newElement.appendChild(mybalance);
  addressElement.appendChild(newElement);


  //出售
  const sell = document.getElementsByClassName("sell");
  setTimeout(() => {
    for (let i = 0; i < sell.length; i++) {
      sell[i].onclick = function () {
        let ID = document.getElementsByClassName("ID");
        // console.log(ID[i].innerHTML)
        let sellprice = document.getElementsByClassName("sellprice");
        // console.log(sellprice)
        // 手动设定燃气上限
        const gasLimit = ethers.utils.hexlify(200000);
        contract.upload(ID[i].innerHTML, sellprice[i].value, { gasLimit })
      }
    }
  }, 1000)
}
//充值
const push = document.getElementById("charge");
push.onclick = function () {
  let money = document.getElementById("money");
  let n = money.value
  contract.recharge(n)
}




