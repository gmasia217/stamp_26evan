// finale.js

// 1. 기존 index.html과 동일한 배역 설정 (이름 매칭용)
const CONFIG = {
  ROLES: [
    { id: "cast1", label: "에반 핸슨", actors: ["박강현", "임규형", "나현우"] },
    { id: "cast2", label: "하이디 핸슨", actors: ["김선영", "신영숙"] },
    { id: "cast3", label: "코너 머피", actors: ["조민호", "김수호"] },
    { id: "cast4", label: "조이 머피", actors: ["강지혜", "장민제"] },
    { id: "cast5", label: "래리 머피", actors: ["장현성", "정동근"] },
    { id: "cast6", label: "신시아 머피", actors: ["안시하", "임민영", "새봄"] },
    { id: "cast7", label: "재러드 클라인먼", actors: ["김강진", "윤현선", "박건우"] },
    { id: "cast8", label: "알라나 벡", actors: ["강은세", "염희진"] }
  ]
};

let state = { records: [] };

// 2. 로컬 스토리지에서 디어 에반 핸슨 기록 불러오기
function loadData() {
    const savedData = localStorage.getItem('evan_tracker_v1');
    if (savedData) {
        state = JSON.parse(savedData);
    }
}

// 3. 중복/유효 기록 필터링 (index.html 로직 재사용)
function getValidRecords() {
    let validRecords = [];
    let grouped = {};
    
    (state.records || []).forEach(r => {
        let k = r.date + '_' + r.time;
        if (!grouped[k]) grouped[k] = [];
        grouped[k].push(r);
    });

    for (let k in grouped) {
        let grp = grouped[k];
        if (grp.length === 1) {
            validRecords.push(grp[0]);
        } else {
            let seated = grp.find(x => x.seatRow !== "" && x.seatNum !== "");
            validRecords.push(seated || grp[0]);
        }
    }
    return validRecords;
}

// 4. 통계 계산 및 화면 텍스트 교체 (Data Injection)
function renderStats() {
    const validRecords = getValidRecords();
    
    // [총 관람 횟수]
    const totalCount = validRecords.length;
    const totalEl = document.getElementById('board-total');
    if (totalEl) totalEl.textContent = totalCount;

    // [배우별 관람 횟수]
    CONFIG.ROLES.forEach((role, idx) => {
        const castKey = `cast${idx + 1}`;
        role.actors.forEach(actor => {
            const count = validRecords.filter(r => r[castKey] === actor).length;
            
            // html에 <span id="count-박강현">0</span> 처럼 아이디가 있다고 가정하고 횟수를 꽂아넣습니다.
            const safeActorId = actor.replace(/\s+/g, ''); // 띄어쓰기 제거
            const actorEl = document.getElementById(`count-${safeActorId}`);
            if (actorEl) {
                actorEl.textContent = count; // 내가 본 횟수
            }
        });
    });

    // [좌석 리스트 렌더링]
    // 텍스트 형태로 예쁘게 나열하기 위해 리스트를 만듭니다.
    const seatContainer = document.getElementById('board-seats');
    if (seatContainer) {
        let seatsHtml = '';
        validRecords.forEach(r => {
            if(r.seatZone && r.seatRow !== "" && r.seatNum !== "") {
                let seatStr = `${r.seatZone} ${r.seatBlock ? r.seatBlock + ' ' : ''}${r.seatRow}열 ${r.seatNum}번`;
                // 말풍선이나 다이어리 줄글 느낌의 태그
                seatsHtml += `<div class="seat-badge">${seatStr}</div>`;
            }
        });
        seatContainer.innerHTML = seatsHtml || '<div class="seat-badge">입력된 좌석 기록이 없습니다.</div>';
    }
}

// 5. 이미지 캡처 및 다운로드 트리거
function downloadFinaleBoard() {
    // 캡처할 타겟 지정 (이 ID를 가진 HTML div를 통째로 찰칵 찍습니다)
    const captureArea = document.getElementById('finale-capture-area');
    
    // 버튼 등을 숨기는 효과를 주려면 여기에 작성

    html2canvas(captureArea, {
        scale: 2,           // 레티나 디스플레이 및 고화질 저장을 위해 2배수 렌더링
        useCORS: true,      // 외부 폰트(Pretendard 등) 깨짐 방지
        backgroundColor: null // 배경을 CSS에 맡김
    }).then(canvas => {
        // 이미지를 png 데이터로 변환
        let imgData = canvas.toDataURL("image/png");
        
        // 다운로드용 a 태그 생성 후 자동 클릭
        let link = document.createElement('a');
        let today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
        link.download = `Dear_Evan_Hansen_정산판_${today}.png`;
        link.href = imgData;
        link.click();
    }).catch(err => {
        console.error("이미지 생성 오류:", err);
        alert("이미지 저장에 실패했습니다.");
    });
}

// 페이지가 로드되면 데이터를 불러오고 화면에 계산값을 꽂아넣습니다.
window.onload = () => {
    loadData();
    renderStats();
};
