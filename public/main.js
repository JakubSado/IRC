let name = undefined
let bar = undefined
let last = -1

function init() {
    enter();
    bar = new SimpleBar(document.getElementById("chat"))
    document.addEventListener("keyup", (e) => {
        if (e.keyCode == 13) {
            e.preventDefault()
            sendMessage()
        }
    })
}

async function enter() {
    const n = prompt("Podaj imie");
    const res = await fetch("/enter", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: n})
    })
    const data = await res.json();
    if (data.ok) {
        last = data.last
        name = data.data;
        getMessages()
    } else {
        enter()
    }
}

async function getMessages() {
    const res = await fetch(`/chat?last=${last}`)
    const data = await res.json();
    console.log(data)
    if (data.multi != undefined) {
        console.log(data.multi)
        data.multi.forEach(m => {
            const div = document.createElement("div");
            div.classList.add("msg")
            const name = document.createElement("span");
            name.innerText = m.msg.from.name
            name.style.color = m.msg.from.color
            const message = document.createElement("span");
            message.innerText = m.msg.message
            $(message).emoticonize({delay: 0})
            const time = document.createElement("span");
            time.innerText = new Date(Date.now()).toLocaleTimeString().substr(0, 5);
            time.classList.add("time")
            div.appendChild(time)
            div.appendChild(name)
            div.appendChild(message)
            bar.getContentElement().appendChild(div)
            const scroll = bar.getScrollElement();
            scroll.scrollTop = scroll.scrollHeight
        })
        last = data.multi[data.multi.length - 1].id
    } else {
    const div = document.createElement("div");
    div.classList.add("msg")
    const name = document.createElement("span");
    name.innerText = data.msg.from.name
    name.style.color = data.msg.from.color
    const message = document.createElement("span");
    message.innerText = data.msg.message
    $(message).emoticonize({delay: 0})
    const time = document.createElement("span");
    time.innerText = new Date(Date.now()).toLocaleTimeString().substr(0, 5);
    time.classList.add("time")
    div.appendChild(time)
    div.appendChild(name)
    div.appendChild(message)
    bar.getContentElement().appendChild(div)
    const scroll = bar.getScrollElement();
    scroll.scrollTop = scroll.scrollHeight
    last = data.id
    }
    getMessages();
}


async function sendMessage() {
    const message = document.getElementById("message").value
    document.getElementById("message").value = ""
    const res = await fetch("/sendMsg", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'name': name, 'message': message})
    })
        if (res.redirected) {
            window.location = res.url
        }
        let d = await res.text();
        if (d != "") {
            name = d
        }
}

window.onload = init