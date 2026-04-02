//ngrok http 5500
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
  apiKey: "AIzaSyB0-nlnQcVk4Uhqv6XXAnc4a9YgBUERs8g",
  authDomain: "groupbuying1-878d8.firebaseapp.com",
  projectId: "groupbuying1-878d8",
  storageBucket: "groupbuying1-878d8.firebasestorage.app",
  messagingSenderId: "267596469344",
  appId: "1:267596469344:web:29efdb45d0bde459ba1f05"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
/////////////////////////////////////////
const IMGBB_API_KEY = "d8e8347273b960ca47dc0dd98e60503e";

// 上傳到 ImgBB
async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (!data.success) {
        throw new Error("圖片上傳失敗");
    }

    return data.data.url; // ⭐ 回傳圖片網址
}

/////////////////////////

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

/////////////////////////////

// 開啟新增頁面
document.getElementById("add_event_btn").addEventListener("click", async () => {
    document.getElementById("add_event_area").style.display = "flex";
    uploadArea.innerHTML = "點擊這裡上傳"; // 清空圖片預覽
});

// 新增活動
/*
document.getElementById("send_btn").addEventListener("click", async () => {

    const eventName = document.getElementById("input_eventName").value.trim(); // trim() 會只留內容
    const eventDescription = document.getElementById("input_eventDescription").value.trim();

    const file = fileInput.files[0]; // 圖片 

    if (!eventName || !eventDescription) {
        alert("請輸入完整資料");
    return;
    }

    let imageBase64 = "";

    if (file) {
        imageBase64 = await fileToBase64(file);
    }

    try {
        await addDoc(collection(db, "events"), {
            eventName,
            eventDescription,
            image: imageBase64, // ⭐ 存這裡
            createdAt: serverTimestamp(), // 比較準的時間
        });

        //alert("新增成功");

        clearInput();
        document.getElementById("add_event_area").style.display = "none";


    } catch (error) {
        console.error("新增失敗:", error);
        alert("新增失敗");
    }
});
*/

document.getElementById("send_btn").addEventListener("click", async () => {

    const eventName = document.getElementById("input_eventName").value.trim();
    const eventDescription = document.getElementById("input_eventDescription").value.trim();
    //const file = document.getElementById("input_image").files[0]; // file[0] 表示第一張
    const files = document.getElementById("input_image").files;

    if (!eventName || !eventDescription) {
        alert("請輸入完整資料");
        return;
    }

    try {
        let imageUrls = [];

        // ⭐ 多張圖片上傳
        for (const file of files) {
            const url = await uploadToImgBB(file);
            imageUrls.push(url);
        }

        await addDoc(collection(db, "events"), {
            eventName,
            eventDescription,
            imageUrls, // ⭐ 存陣列
            createdAt: serverTimestamp(),
        });

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

document.getElementById("close_event_info_btn").addEventListener("click", async () => {
    document.getElementById("event_info").style.display = "none";
});

// 清空輸入欄
function clearInput(){
    document.getElementById("input_eventName").value = "";
    document.getElementById("input_eventDescription").value = "";
    document.getElementById("input_image").value = ""; // 清空圖片
}


// 即時監聽與顯示當前活動
const event_list = document.getElementById("current_event");

// 確保 createdAt 存在 新增的放在上面
const q = query(
    collection(db, "events"),
    orderBy("createdAt", "desc")
);



// onsnapshot
onSnapshot(
    q,
    (snapshot) => {
        event_list.innerHTML = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();

            const event = document.createElement("div"); // 建立 event 元件
            event.classList.add("event");
            event.dataset.id = docSnap.id; // 給入唯一ID

            event.style.cursor = "pointer";

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
            /* 時間格式
            const date = timestamp.toDate();
            const millis = timestamp.toMillis();
            const formatted = timestamp.toDate().toLocaleString();
            */

            let text = "時間處理中...";

            if (data.createdAt) {
                const now = data.createdAt.toDate();

                const year = now.getFullYear();
                const month = String(now.getMonth()+1).padStart(2,"0");
                const day = String(now.getDate()).padStart(2,"0");

                const hours = String(now.getHours()).padStart(2,"0");
                const minutes = String(now.getMinutes()).padStart(2,"0");
                const seconds = String(now.getSeconds()).padStart(2,"0");

                text = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }


            content.innerHTML =
                "活動名稱 : " + (data.eventName || "") + "<br>" +
                "建立日期 : " +  text + "<br>" +
                "活動描述 : " + (data.eventDescription || "");



            // 展開詳情
            event.addEventListener("click", () => {

                // 文字
                document.getElementById("detail_eventName").value = data.eventName || "";
                document.getElementById("detail_eventDescription").value = data.eventDescription || "";
                document.getElementById("detail_eventTime").value = text;

                // 圖片
                const imageArea = document.getElementById("detail_image_area");
                imageArea.innerHTML = "";

                if (data.imageUrls && data.imageUrls.length > 0) {
                    data.imageUrls.forEach(url => {
                        const img = document.createElement("img");
                        img.src = url;

                        img.style.width = "50%";
                        img.style.maxHeight = "100px";
                        img.style.objectFit = "cover";
                        img.style.borderRadius = "10px";
                        img.style.marginTop = "10px";

                        imageArea.appendChild(img);
                    });
                }

                document.getElementById("event_info").style.display = "flex";
            });


            // 組裝
            event.appendChild(deleteBtn);
            event.appendChild(content);

            // ⭐ 顯示圖片
            if (data.imageUrl) {
                const img = document.createElement("img");
                img.src = data.imageUrl;
                img.style.width = "10%";
                img.style.borderRadius = "10px";
                img.style.marginTop = "10px";

                event.appendChild(img);
            }

            event_list.appendChild(event);
        });
    },
    (error) => {
        console.error("onSnapshot 錯誤:", error);
        alert("資料讀取失敗，請查看 console");
    }
);





// 照片上傳
document.getElementById("image_upload_area").addEventListener("click", async () => {
    document.getElementById("input_image").click();
});

// 顯示預覽
const inputImage = document.getElementById("input_image");
const uploadArea = document.getElementById("image_upload_area");


inputImage.addEventListener("change", () => {
    const files = inputImage.files;
    uploadArea.innerHTML = "";

    for (const file of files) {
        const reader = new FileReader();

        reader.onload = e => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.height = "50%";
            img.style.margin = "5px";
            img.style.borderRadius = "10px";

            uploadArea.appendChild(img);
        };

        reader.readAsDataURL(file);
    }
});



