// 變數宣告
let quizTable; // 儲存 p5.Table 物件
let questions = []; // 儲存從CSV讀取的題目
let currentQuestion; // 當前題目
let currentQuestionIndex = 0; // 當前題目索引
let correctAnswers = 0; // 正確答案數
let gameState = 'START'; // 遊戲狀態: START, QUIZ, END
let startButton; // 測驗開始按鈕
let selectedAnswer = null; // 用戶選擇的答案
let optionRects = []; // 儲存四個選項的矩形位置

// 在 setup 和 draw 之前載入資源
function preload() {
  quizTable = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
  createCanvas(800, 600);
  textFont('Arial');
  textSize(20);
  fill(0);

  // 建立「測驗開始」按鈕
  startButton = createButton('測驗開始');
  startButton.position(width / 2 - 50, height / 2 + 60);
  startButton.style('font-size', '18px');
  startButton.style('padding', '10px 30px');
  startButton.mousePressed(startQuiz);

  // 偵錯：檢查題庫是否載入
  if (!quizTable) {
    console.error('quizTable 未載入');
    return;
  }

  console.log('載入題目數:', quizTable.getRowCount());

  // 讀取 CSV 資料
  for (let r = 0; r < quizTable.getRowCount(); r++) {
    let row = quizTable.getRow(r);
    questions.push({
      question: row.get('Question'),
      optionA: row.get('OptionA'),
      optionB: row.get('OptionB'),
      optionC: row.get('OptionC'),
      optionD: row.get('OptionD'),
      correctOption: row.get('CorrectOption')
    });
  }

  console.log('成功讀取題目:', questions.length);
}

function startQuiz() {
  if (questions.length === 0) {
    console.warn('無題庫，無法開始測驗');
    return;
  }
  gameState = 'QUIZ';
  startButton.hide();
  currentQuestionIndex = 0;
  currentQuestion = questions[currentQuestionIndex];
  selectedAnswer = null;
}

function draw() {
  background(240);

  if (gameState === 'START') {
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(0);
    text('歡迎參加線上測驗', width / 2, height / 2 - 40);
    textSize(18);
    text('共 ' + questions.length + ' 題', width / 2, height / 2);
    return;
  }

  if (gameState === 'QUIZ') {
    if (!currentQuestion) return;
    
    textAlign(LEFT, TOP);
    textSize(18);
    fill(0);
    
    // 顯示題目進度
    text('第 ' + (currentQuestionIndex + 1) + ' / ' + questions.length, 20, 20);
    
    // 顯示題目
    textSize(20);
    text(currentQuestion.question, 20, 60, width - 40);
    
    // 定義選項位置與繪製
    optionRects = [];
    let options = ['A', 'B', 'C', 'D'];
    let optionValues = [
      currentQuestion.optionA,
      currentQuestion.optionB,
      currentQuestion.optionC,
      currentQuestion.optionD
    ];
    
    for (let i = 0; i < 4; i++) {
      let y = 150 + i * 50;
      let rectHeight = 40;
      let rectX = 40;
      let rectY = y - 10;
      let rectWidth = width - 80;
      
      // 儲存矩形位置供點擊判斷
      optionRects.push({
        x: rectX,
        y: rectY,
        w: rectWidth,
        h: rectHeight,
        option: options[i]
      });
      
      // 繪製背景（選中時變色）
      if (selectedAnswer === options[i]) {
        fill(100, 200, 100); // 綠色表示已選
      } else {
        fill(200, 200, 200);
      }
      stroke(0);
      strokeWeight(2);
      rect(rectX, rectY, rectWidth, rectHeight);
      
      // 繪製文字
      fill(0);
      noStroke();
      textSize(16);
      textAlign(LEFT, CENTER);
      text(options[i] + '. ' + optionValues[i], rectX + 10, rectY + rectHeight / 2);
    }
    
    // 下一題按鈕
    if (selectedAnswer !== null) {
      drawNextButton();
    }
  }

  if (gameState === 'END') {
    drawScorePage();
  }
}

function drawNextButton() {
  fill(0, 100, 255);
  stroke(0);
  strokeWeight(2);
  rect(width / 2 - 60, height - 60, 120, 40);
  
  fill(255);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text('下一題', width / 2, height - 40);
}

function drawScorePage() {
  background(200, 220, 255);
  
  textAlign(CENTER, CENTER);
  textSize(36);
  fill(0);
  text('測驗完成！', width / 2, height / 2 - 100);
  
  textSize(28);
  fill(0, 100, 200);
  text('您的得分', width / 2, height / 2 - 20);
  
  // 計算分數：每題 10 分
  let totalScore = correctAnswers * 10;
  
  textSize(48);
  fill(0, 150, 0);
  text(totalScore + ' / 100 分', width / 2, height / 2 + 50);
  
  textSize(20);
  fill(0);
  text('正確題數：' + correctAnswers + ' / ' + questions.length, width / 2, height / 2 + 120);
  
  // 顯示重新開始按鈕提示
  textSize(16);
  text('按 F5 刷新頁面重新開始', width / 2, height - 40);
}

function mousePressed() {
  if (gameState !== 'QUIZ') return;
  
  // 檢查是否點擊選項
  for (let rect of optionRects) {
    if (mouseX > rect.x && mouseX < rect.x + rect.w &&
        mouseY > rect.y && mouseY < rect.y + rect.h) {
      selectedAnswer = rect.option;
      console.log('選擇了選項:', selectedAnswer);
      return;
    }
  }
  
  // 檢查是否點擊「下一題」按鈕
  if (selectedAnswer !== null &&
      mouseX > width / 2 - 60 && mouseX < width / 2 + 60 &&
      mouseY > height - 60 && mouseY < height - 20) {
    goToNextQuestion();
  }
}

function goToNextQuestion() {
  // 檢查答案是否正確
  if (selectedAnswer === currentQuestion.correctOption) {
    correctAnswers++;
    console.log('正確！總分:', correctAnswers);
  } else {
    console.log('錯誤。正確答案是:', currentQuestion.correctOption);
  }
  
  currentQuestionIndex++;
  
  if (currentQuestionIndex < questions.length) {
    currentQuestion = questions[currentQuestionIndex];
    selectedAnswer = null;
  } else {
    // 測驗完成
    gameState = 'END';
  }
}