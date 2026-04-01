import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



const firebaseConfig = {
  apiKey: "AIzaSyA7lj_evdSkierw1tg-8mz_-T8JNiAqoXA",
  authDomain: "groupbuying1-f5d3b.firebaseapp.com",
  projectId: "groupbuying1-f5d3b",
  storageBucket: "groupbuying1-f5d3b.firebasestorage.app",
  messagingSenderId: "488132342309",
  appId: "1:488132342309:web:8a719884572e4220ad85cc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/////////////////////////////////////////

// LINE 使用者資訊
liff.init({ liffId: '2009518520-I9r9w3Ic' })
.then(() => {
    if (!liff.isLoggedIn()) {
        liff.login({
            redirectUri: window.location.href
        });
        return;
    }

    return liff.getProfile();
})
.then(profile => {
    if (!profile) return;

    document.getElementById("userId").innerText = "userId: " + profile.userId;
    document.getElementById("name").innerText = "name: " + profile.displayName;
    document.getElementById("avatar").src = profile.pictureUrl;
})
.catch(err => {
    console.error(err);
});

// 開啟新增頁面
document.getElementById("add_event_btn").addEventListener("click", async () => {
    document.getElementById("add_event_area").style.display = "flex";
});


// 新增活動
document.getElementById("send_btn").addEventListener("click", async () => {

    const eventName = document.getElementById("input_eventName").value.trim(); // trim() 會只留內容
    const eventDescription = document.getElementById("input_eventDescription").value.trim();

    if (!eventName || !eventDescription) {
        alert("請輸入完整資料");
    return;
}

    try {
        await addDoc(collection(db, "events"), {
            eventName,
            eventDescription,
            createdAt: serverTimestamp(), // 比較準的時間
        });

        alert("新增成功");

        clearInput();
        document.getElementById("add_event_area").style.display = "none";


    } catch (error) {
        console.error("新增失敗:", error);
        alert("新增失敗");
    }
});

// 關閉新增頁面
document.getElementById("close_btn").addEventListener("click", async () => {
    clearInput();
    document.getElementById("add_event_area").style.display = "none";
});

// 清空輸入欄
function clearInput(){
    document.getElementById("input_eventName").value = "";
    document.getElementById("input_eventDescription").value = "";
}


// 即時監聽與顯示當前活動
const event_list = document.getElementById("current_event");

// 確保 createdAt 存在 新增的放在上面
const q = query(
    collection(db, "events"),
    orderBy("createdAt", "desc")
);



// 加入錯誤處理
onSnapshot(
    q,
    (snapshot) => {
        event_list.innerHTML = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();

            const event = document.createElement("div"); // 建立 event 元件
            event.classList.add("event");
            event.dataset.id = docSnap.id; // 給入唯一ID

            const deleteBtn = document.createElement("button"); // 刪除按鈕
            deleteBtn.classList.add("delete-btn");
            deleteBtn.textContent = "✕";

            // 防止點刪除時觸發卡片點擊
            deleteBtn.addEventListener("click", async (e) => {
                e.stopPropagation(); // 阻止當前事件繼續進行捕捉

                const confirmDelete = confirm("確定要刪除嗎？");
                if (!confirmDelete) return;

                try {
                    await deleteDoc(doc(db, "events", docSnap.id)); // 刪掉 event
                    alert("刪除成功");
                    //toastr.success( "刪除成功！" );
                    
                } catch (error) {
                    console.error("刪除失敗:", error);
                    alert("刪除失敗");
                    //toastr.error( "刪除失敗" );
                }
            });

            // 內容
            const content = document.createElement("div");
            /*
            content.textContent =
                "活動名稱 : " + (data.eventName || "") + '\n' +
                "活動描述 : " + (data.eventDescription || "");4
            */
            content.innerHTML =
                "活動名稱 : " + (data.eventName || "") + "<br>" +
                "建立日期 : " + (data.createdAt || "") + "<br>" +
                "活動描述 : " + (data.eventDescription || "");



            // 組裝
            event.appendChild(deleteBtn);
            event.appendChild(content);

            event_list.appendChild(event);
        });
    },
    (error) => {
        console.error("onSnapshot 錯誤:", error);
        alert("資料讀取失敗，請查看 console");
    }
);