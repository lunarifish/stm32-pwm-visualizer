// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById("chart"));

// 指定图表的配置项和数据
var option = {
  title: {
    text: "pwm output",
  },
  tooltip: {},
  legend: {
    data: [""],
  },
  xAxis: {
    data: Array.from({ length: 100 }, (val, i) => i),
  },
  yAxis: {},
  series: [
    {
      name: "output",
      type: "line",
      smooth: false,
      symbol: "none",
      stack: "a",
      areaStyle: {
        normal: {},
      },
      data: Array.from({ length: 100 }, (val, i) => 0),
    },
  ],
};

function insertData(new_data) {
  option.series[0].data.unshift(new_data);
  option.series[0].data.pop();
}

// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);

/*************************/

var parameters = {
  clock_freq: 1000,
  ccr: 10,
  cnt_max: 15,
};
var interval_handle = null;

var current_cnt = 0;

function output(cnt_val) {
    return parameters.cnt_max - cnt_val < parameters.ccr;
}

function cntIncrease() {
  const table = document.getElementById("cntRegister");
  const rows = table.rows;
  for (let i = rows.length - 1; i >= 0; i--) {
    rows[i].cells[0].classList.remove("active-under");
    rows[i].cells[0].classList.remove("active-over");
    rows[i].cells[0].innerHTML = "";
  }
  rows[current_cnt].cells[0].innerHTML = parameters.cnt_max - current_cnt;
  if (output(current_cnt)) {
    rows[current_cnt].cells[0].classList.add("active-over");
  } else {
    rows[current_cnt].cells[0].classList.add("active-under");
  }
  current_cnt--;
  if (current_cnt < 0) {
    current_cnt = parameters.cnt_max;
  }
}

function updateChart() {
  const cmp = parameters.ccr;
  insertData(output(current_cnt));
  myChart.setOption(option);
}

function clockStep() {
  cntIncrease();
  updateChart();
}

function updateParameters() {
  const tim_freq = document.getElementById("frequency").value;
  const ccr = document.getElementById("ccr").value;
  const resultDiv = document.getElementById("result");

  const table = document.getElementById("cntRegister");
  const rows = table.rows;
  for (let i = rows.length - 1; i >= 0; i--) {
    rows[i].cells[0].classList.remove("ccr-border");
  }

  parameters.clock_freq = tim_freq;
  parameters.ccr = ccr;

  rows[parameters.cnt_max - parameters.ccr].cells[0].classList.add("ccr-border");

  if (tim_freq && ccr) {
    resultDiv.innerHTML = `
                <h3>定时器频率: ${tim_freq} Hz</h3>
                <h3>CCR: ${parameters.ccr}</h3>
                <hr>
                <h3>占空比: ${parameters.ccr / (parameters.cnt_max + 1) * 100}%</h3>
                <h3>PWM频率: ${tim_freq / (parameters.cnt_max + 1)} Hz
                <h3>等效电压: ${(parameters.ccr / parameters.cnt_max) * 3.3} V
            `;
    if (interval_handle) {
      clearInterval(interval_handle);
    }
    interval_handle = setInterval(clockStep, 1000 / tim_freq);
  } else {
    resultDiv.innerHTML = "<p>请填写所有参数。</p>";
  }
}

function createCNTTable(rows) {
  const table = document.getElementById("cntRegister");
  table.innerHTML = ""; // 清空表格内容
  for (let i = 0; i < rows; i++) {
    const row = table.insertRow();
    const cell = row.insertCell();
    if (i === rows - 1) {
      cell.classList.add("active");
    }
  }
}

// 创建一个具有16行的CNT寄存器表格
createCNTTable(parameters.cnt_max + 1);
