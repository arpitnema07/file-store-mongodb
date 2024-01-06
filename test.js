let list = new Array();

for (var a = 0; a < 114; a++) {
  list[a] = document.getElementById("trr" + a);
}

function selectorrr(list, valuee) {
  list.forEach(function (ele) {
    if (ele.childNodes[2].innerHTML.startsWith(valuee)) {
      if (!ele.childNodes[1].firstChild.checked) {
        if (!ele.childNodes[4].innerHTML.match("CM")) {
          ele.childNodes[1].firstChild.click();
          console.log(ele.childNodes[2].innerHTML);
        }
      }
    }
  });
}

function deSelectorrr(list, valuee) {
  list.forEach(function (ele) {
    if (ele.childNodes[2].innerHTML.startsWith(valuee)) {
      if (ele.childNodes[1].firstChild.checked) {
        ele.childNodes[1].firstChild.click();
        console.log(ele.childNodes[2].innerHTML);
      }
    }
  });
}

function selectorrrWithWord(list, valuee) {
  list.forEach(function (ele) {
    if (ele.childNodes[4].innerHTML.match(valuee)) {
      if (!ele.childNodes[1].firstChild.checked) {
        if (!ele.childNodes[4].innerHTML.match("CM")) {
          ele.childNodes[1].firstChild.click();
          console.log(ele.childNodes[2].innerHTML);
        }
      }
    }
  });
}
