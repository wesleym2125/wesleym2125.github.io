var search_btn = null;
var type_select = null;
var input_text = null;
var year_select = null;
var years = {"21": {"start": "21", "end": "22"},"22": {"start": "22", "end":"23"}};
var program_type = ["major", "minor", "ext_major", "req"];

function year_to_string(pattern, start, end) {
    output = pattern.replaceAll("CC", "20").replaceAll("YY", start).replaceAll("ZZ", end);
    return output;
}

function search(url) {
    year_option = year_select.value;
    start = years[year_option]["start"];
    end = years[year_option]["end"];
    _url =  year_to_string(url, start, end);
    window.open(_url, target="_blank");
}

function modify_display_suggest(items) {
    if (items.length == 0) {
        suggestions.style.visibility = "hidden";
    } else {
        suggestions.style.visibility = "visible";
    }
    child = suggestions.lastElementChild;
    while (child) {
        suggestions.removeChild(child);
        child = suggestions.lastElementChild;
    }
    program_size = items.length;
    if (program_size > 5) {
        program_size = 5;
    }
    for (var i=0;i<program_size;i++) {
        div = document.createElement("div");
        index = parseInt(items[i][0]);
        _type = program_type[Math.floor(index / 1000) - 1];
        name = program_data[_type][index % 1000]["name"];
        url_ug = program_data[_type][index % 1000]["url-ug"];
        div2 = document.createElement("div");
        div2.innerHTML = name;
        div.className = "program-options";
        div.appendChild(div2);
        div.setAttribute("onclick", 'search("' + url_ug + '")');
        suggestions.appendChild(div);
    }
}

function update_suggest(modify_display) {
    occur_count = new Object();
    text_value = input_text.value;
    keywords = text_value.split(" ");
    word_count = keywords.length;
    valid_word = word_count;
    for (var i=0;i<word_count;i++) {
        last = -1;
        var back_pos = [-1];
        word = keywords[i].toLowerCase();
        if (word == "" || word == "in") {
            valid_word--;
            continue;
        }
        added_list = [];
        for (var j=1;j<word.length;j++) {
            if (word.charAt(j) == word.charAt(last + 1)) {
                back_pos.push(last+1);
                last++;
            } else {
                last = -1;
                back_pos.push(-1);
            }
        }
        for (var j=0;j<keywords_count;j++) {
            target = Object.keys(search_kw)[j];
            match = false;
            check_pos = 0;
            for (var k=0;k<target.length;k++) {
                checked = false;
                if (check_pos >= word.length) {
                    match = true;
                    break;
                }
                while (check_pos > 0 && !checked) {
                    if (target.charAt(k) == word.charAt(check_pos)) {
                        check_pos++;
                        checked = true;
                    } else {
                        check_pos = back_pos[check_pos - 1] + 1;
                    }
                }
                if (check_pos == 0 && !checked) {
                    if (target.charAt(k) == word.charAt(0)) {
                        check_pos++;
                        checked = true;
                    } else {
                        check_pos = 0;
                    }
                }
            }
            if (check_pos >= word.length) {
                match = true;
            }
            if (match) {
                for (var k=0;k<search_kw[target].length;k++) {
                    index = search_kw[target][k];
                    if (!(index in occur_count)) {
                        occur_count[index] = 1;
                    } else if (added_list.indexOf(index) == -1) {
                        occur_count[index] = occur_count[index] + 1;
                    }
                    if (added_list.indexOf(index) == -1) {
                        added_list.push(index);
                    }
                }
            }
        }
    }

    var items = Object.keys(occur_count).map((key) => [key, occur_count[key]]);
    items = items.filter(item => item[1] >= valid_word);
    items.sort((first, second) => second[1] - first[1]);
    if (type_select.value != "all") {
        items = items.filter(item => ((Math.floor(parseInt(item[0]) / 1000) - 1) == program_type.indexOf(type_select.value)));
    }
    
    if (modify_display) {
        modify_display_suggest(items);
    }

    return items;
}

function text_change(event) {
    update_suggest(true);
}

function check_search() {
    var items = update_suggest(false);
    if (items.length == 1) {
        index = parseInt(items[0][0]);
        _type = program_type[Math.floor(index / 1000) - 1];
        search(program_data[_type][index % 1000]["url-ug"]);
    } else if (items.length > 1) {
        text = input_text.value;
        for (var i=0;i<items.length;i++) {
            index = parseInt(items[i][0]);
            _type = program_type[Math.floor(index / 1000) - 1];
            if (text.toLowerCase() == program_data[_type][index % 1000]["code"]) {
                search(program_data[_type][index % 1000]["url-ug"]);
                break;
            }
        }
    }
}

function btn_click(event) {
    check_search();
}

function enter_search(event) {
    if (event.code == "Enter") {
        check_search();
    }
}

function change_course_type(event) {
    update_suggest(true);
}

function addYears() {
    year_no = years.length();
    for (var i=0;i<year_no;i++) {
        option = document.createElement("option");
        option.setAttribute("value", i + '');
        start_year = years[i].start + '';
        end_year = years[i].end + '';
        option.innerHTML = '20' + start_year + ' - ' + end_year;
        year_select.appendChild(option);
    }
}

window.onload = function() {
    search_btn = document.querySelector("#search");
    type_select = document.querySelector("#course-type");
    input_text = document.querySelector("#search-text");
    suggestions = document.querySelector("#suggestions");
    search_btn.addEventListener("click", btn_click);
    input_text.addEventListener("keyup", text_change);
    input_text.addEventListener("keypress", enter_search);
    type_select.addEventListener("change", change_course_type);
    year_select = document.querySelector("#year");
}