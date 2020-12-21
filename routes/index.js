var express = require('express');
const session = require('express-session');
const { set } = require('../app');
var router = express.Router();

var nowPlayerNum = 0;
var p1name = '';
var p2name = '';

// DATA AREA
var score = new Array(2)
score[0] = new Array(12)
score[1] = new Array(12)
for(var i=0; i<12; i++){
  score[0][i] = -1;
  score[1][i] = -1;
}
// score[1] = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]

var bonus = [0, 0];

var subTotal = [0, 0];
var total = [0, 0];

var dice = [];

var chance = 3;

var turn = 1;

// GAMEPLAY AREA

function randBetween(start, end){
  return Math.floor(Math.random() * (end-start+1) + start)
}

function roll(keepArray) { 
  for(var i=0; i<5; i++){
    if(keepArray[i]){
      continue;
    }
    else{
      dice[i] = randBetween(1, 6);
    }
  }
}

function calcScore() {
  // Aces
  var aceScore = 0;
  for(var i=0; i<5; i++){
    if(dice[i] == 1){
      aceScore += 1;
    }
  }

  // Deuces
  var deuceScore = 0;
  for(var i=0; i<5; i++){
    if(dice[i] == 2){
      deuceScore += 2;
    }
  }

  // Threes
  var threeScore = 0;
  for(var i=0; i<5; i++){
    if(dice[i] == 3){
      threeScore += 3;
    }
  }

  // Fours
  var fourScore = 0;
  for(var i=0; i<5; i++){
    if(dice[i] == 4){
      fourScore += 4;
    }
  }

  // Fives
  var fiveScore = 0;
  for(var i=0; i<5; i++){
    if(dice[i] == 5){
      fiveScore += 5;
    }
  }

  // Sixes
  var sixScore = 0;
  for(var i=0; i<5; i++){
    if(dice[i] == 6){
      sixScore += 6;
    }
  }

  // Choice
  var choiceScore = 0;
  for(var i=0; i<5; i++){
    choiceScore += dice[i];
  }
  if(isNaN(choiceScore)) {
    choiceScore = 0
  }

  var numNum = [0, 0, 0, 0, 0, 0];
  for(var i=0; i<5; i++){
    numNum[dice[i]-1]++;
  }
  
  // FourKind
  var isFourKind = false;
  isFourKind = numNum.find(n => n >= 4);
  var fourKindScore = isFourKind ? choiceScore : 0;

  // FullHouse
  var isFullHouse = false;
  isFullHouse = (numNum.find(n => n == 3) && numNum.find(n => n == 2)) || numNum.find(n => n == 5)
  var fullHouseScore = isFullHouse ? choiceScore : 0;

  // SS
  var isSS = false;
  var ssScore = 0;
  if(
    dice.find(d => d == 1) &&
    dice.find(d => d == 2) &&
    dice.find(d => d == 3) &&
    dice.find(d => d == 4)
  ) {
    isSS = true;
  }
  if(
    dice.find(d => d == 5) &&
    dice.find(d => d == 2) &&
    dice.find(d => d == 3) &&
    dice.find(d => d == 4)
  ) {
    isSS = true;
  }
  if(
    dice.find(d => d == 5) &&
    dice.find(d => d == 6) &&
    dice.find(d => d == 3) &&
    dice.find(d => d == 4)
  ) {
    isSS = true;
  }
  if(isSS) {
    ssScore = 15;
  }

  // LS
  var isLS = false;
  var lsScore = 0;
  if(
    dice.find(d => d == 1) &&
    dice.find(d => d == 2) &&
    dice.find(d => d == 3) &&
    dice.find(d => d == 4) &&
    dice.find(d => d == 5)
  ) {
    isLS = true;
  }
  if(
    dice.find(d => d == 6) &&
    dice.find(d => d == 2) &&
    dice.find(d => d == 3) &&
    dice.find(d => d == 4) &&
    dice.find(d => d == 5)
  ) {
    isLS = true;
  }
  if(isLS){
    lsScore = 30;
  }

  // YACHT
  var yachtScore = 0;
  var diceSet = new Set(dice);
  if(diceSet.size == 1){
    yachtScore = 50;
  }

  return [
    aceScore,
    deuceScore,
    threeScore,
    fourScore,
    fiveScore,
    sixScore,
    choiceScore,
    fourKindScore,
    fullHouseScore,
    ssScore,
    lsScore,
    yachtScore
  ]
}

function updateBonus () {
  var p1Category = 0;
  var p2Category = 0;
  for(var i=0; i<6; i++){
    p1Category += score[0][i];
    p2Category += score[1][i];
  }
  if(p1Category >= 63) {
    bonus[0] = 35;
  }
  if(p2Category >= 63) {
    bonus[1] = 35;
  }
}

function updateSubTotal () {
  var p1SubTotal = 0;
  var p2SubTotal = 0;
  for(var i=0; i<6; i++){
    if(score[0][i] != -1){
      p1SubTotal += score[0][i];
    }
    if(score[1][i] != -1){
      p2SubTotal += score[1][i];
    }
  }
  subTotal[0] = p1SubTotal;
  subTotal[1] = p2SubTotal;
}

function updateTotal () {
  var p1Total = 0;
  var p2Total = 0;
  for(var i=0; i<12; i++){
    if(score[0][i] != -1){
      p1Total += score[0][i];
    }
    if(score[1][i] != -1){
      p2Total += score[1][i];
    }
  }
  p1Total += bonus[0];
  p2Total += bonus[1];

  total[0] = p1Total;
  total[1] = p2Total;
}

function setScore(num){
  expectedScore = calcScore()
  if(score[(turn + 1) % 2][num] != -1) {
    return;
  }

  score[(turn + 1) % 2][num] = expectedScore[num];
  
  updateBonus();
  updateSubTotal();
  updateTotal();

  dice = [];
  chance = 3;
  turn++;
}



/* GET home page. */
router.route('/').get(
  function(req, res) {
    res.render('index', { playerNum: nowPlayerNum });
  }
);

router.route('/join').post(
  function (req, res) {
    if(nowPlayerNum < 2) {
      if(req.session.user){
      }
      else{
        if(nowPlayerNum == 0){
          p1name = req.body.id
        }
        if(nowPlayerNum == 1){
          p2name = req.body.id
        }
        req.session.user = {
          "id": nowPlayerNum,
          "name": req.body.id
        }
        nowPlayerNum++;
      }
    }
    res.redirect('/room')
  }
);

router.route('/roll').post(
  function (req, res) {
    if(req.session.user.name == p1name && turn%2 == 1) {  // Player 1
      if(chance > 0){
        var keepArray = req.body.keepArray.map(r => {
          if(r == "0"){
            return false
          }
          else{
            return true
          }
        });
        if(chance == 3) {
          keepArray = [false, false, false, false, false]
        }
        chance--;
        roll(keepArray);
        res.redirect('/room')
      }
      // res.render('room')
    }
    else if(req.session.user.name == p2name && turn%2 == 0) { // Player 2
      if(chance > 0){
        var keepArray = req.body.keepArray.map(r => {
          if(r == "0"){
            return false
          }
          else{
            return true
          }
        });
        if(chance == 3) {
          keepArray = [false, false, false, false, false]
        }
        roll(keepArray);
        chance--;
        res.redirect('/room')
      }
      // res.render('room')
    }
    else{
      res.redirect('/room')
    }
    res.redirect('/room')
  }
)

router.route('/setScore/:scoreNum').get(
  function (req, res) {
    if(req.session.user.name == p1name && turn%2 == 1) {  // player 1
      setScore(req.params.scoreNum)
    }
    else if (req.session.user.name == p2name && turn%2 == 0) {  // player 2
      setScore(req.params.scoreNum)
    }
    console.log(score)
    res.redirect('/room')
  }
)

router.route('/room').get(
  function (req, res) {
    calcScoreDummy = (turn%2==0) ? [new Array(12), calcScore()] : [calcScore(), new Array(12)]
    res.render('room', { p1: p1name, p2: p2name, dice: dice, chance: chance, score, calcScoreDummy, subTotal, total, bonus, turn });
  }
)

module.exports = router;
