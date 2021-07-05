const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it("can add the star name and star symbol properly", async () => {
  let name = "Dinesh Star";
  let symbol = "DNS";
  let instance = await StarNotary.new(name, symbol);
  let starName = await instance.name.call();
  let starSymbol = await instance.symbol.call();
  assert.equal(starName, name);
  assert.equal(starSymbol, symbol);
});

it("lets 2 users exchange stars", async () => {
  let name1 = "Test star 1";
  let token1 = 6;
  let name2 = "Test star 2";
  let token2 = 7;
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  await instance.createStar(name1, token1, { from: user1 });
  await instance.createStar(name2, token2, { from: user2 });
  await instance.exchangeStars(token1, token2, { from: user1 });
  assert.equal(await instance.ownerOf.call(token1), user2);
  assert.equal(await instance.ownerOf.call(token2), user1);
});

it("lets a user transfer a star", async () => {
  let starName = "Test transfer star";
  let tokenId = 8;
  let user1 = accounts[1];
  let user2 = accounts[2];
  let instance = await StarNotary.deployed();
  await instance.createStar(starName, tokenId, { from: user1 });
  await instance.transferStar(user2, tokenId, { from: user1 });
  assert(await instance.ownerOf.call(tokenId), user2);
});

it("lookUptokenIdToStarInfo test", async () => {
  let starName = "Test lookup star";
  let tokenId = 9;
  let user = accounts[1];
  let instance = await StarNotary.deployed();
  await instance.createStar(starName, tokenId, { from: user });
  let name = await instance.lookUptokenIdToStarInfo.call(tokenId);
  assert.equal(name, starName);
});
