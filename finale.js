// finale.js (앞부분의 CONFIG, THEATER_ZONES, renderStats 등은 동일합니다.)

const CONFIG = {
    ROLES: [
        { id: "cast1", label: "에반 핸슨", actors: ["박강현", "임규형", "나현우"] },
        { id: "cast2", label: "하이디 핸슨", actors: ["김선영", "신영숙"] },
        { id: "cast3", label: "코너 머피", actors: ["조민호", "김수호"] },
        { id: "cast4", label: "조이 머피", actors: ["강지혜", "장민제"] },
        { id: "cast5", label: "래리 머피", actors: ["장현성", "정동근", "김영훈"] },
        { id: "cast6", label: "신시아 머피", actors: ["안시하", "임민영", "새봄"] },
        { id: "cast7", label: "재러드 클라인먼", actors: ["김강진", "윤현선", "박건우"] },
        { id: "cast8", label: "알라나 벡", actors: ["강은세", "염희진", "손설빈"] }
    ]
};

function range(start, end) { let arr = []; for(let i=start; i<=end; i++) arr.push(i); return arr; }
function padLeft(arr, total) { return [...Array(total - arr.length).fill(null), ...arr]; }
function padRight(arr, total) { return [...arr, ...Array(total - arr.length).fill(null)]; }
function mapToBlock(arr, blockName) { return arr.map(n => n !== null ? { b: blockName, n: n } : null); }
function centerInBlock(arr, targetWidth) {
    let diff = targetWidth - arr.length;
    let res = [...arr];
    let nulls = Math.floor(diff / 2);
    let needsHalf = diff % 2 !== 0;
    let leftPads = Array(nulls).fill(null);
    let rightPads = Array(nulls).fill(null);
    if (needsHalf) res = ['h', ...res, 'h'];
    return [...leftPads, ...res, ...rightPads];
}

const THEATER_ZONES = [
    {
        name: '1층',
        rows: (() => {
            let rows = [];
            for(let r=1; r<=21; r++) {
                let L, C, R;
                let cMax = (r % 2 !== 0) ? 17 : 16;
                if(r<=3) { L = padLeft(range(1,7), 9); C = range(1, cMax); R = padRight(range(1,7), 9); }
                else if(r===4) { L = padLeft(range(1,8), 9); C = range(1, cMax); R = padRight(range(1,8), 9); }
                else if(r<=20) { L = range(1,9); C = range(1, cMax); R = range(1,9); }
                else if(r===21) { L = padLeft(range(1,6), 9); C = range(1, cMax); R = padRight(range(1,7), 9); } 
                
                L = mapToBlock(L, 'A구역'); 
                C = centerInBlock(mapToBlock(C, 'B구역'), 17);
                R = mapToBlock(R, 'C구역');
                rows.push({ id: String(r), map: [...L, 'a', ...C, 'a', ...R] });
            }
            return rows;
        })()
    },
    {
        name: '2층',
        rows: (() => {
            let rows = [];
            for(let r=1; r<=11; r++) {
                let L, C, R;
                let cMax = (r % 2 !== 0) ? 16 : 15;
                if(r<=6) { L = range(1,9); C = range(1, cMax); R = range(1,9); }
                else if(r===7) { L = padLeft(range(1,7), 9); C = range(1, cMax); R = padRight(range(1,6), 9); }
                else if(r===8) { L = Array(9).fill(null); C = range(1, 14); R = Array(9).fill(null); }
                else if(r===9) { L = Array(9).fill(null); C = range(1, 13); R = Array(9).fill(null); }
                else if(r===10) { L = Array(9).fill(null); C = range(1, 12); R = Array(9).fill(null); }
                else if(r===11) { L = Array(9).fill(null); C = range(1, 11); R = Array(9).fill(null); }
                
                L = mapToBlock(L, 'A구역'); 
                C = centerInBlock(mapToBlock(C, 'B구역'), 16);
                R = mapToBlock(R, 'C구역');
                rows.push({ id: String(r), map: [...L, 'a', ...C, 'a', ...R] });
            }
            return rows;
        })()
    },
    {
        name: '3층',
        rows: (() => {
            let rows = [];
            for(let r=1; r<=8; r++) {
                let cMax = (r % 2 !== 0) ? 16 : 15;
                let L = mapToBlock(range(1,9), 'A구역');
                let C = centerInBlock(mapToBlock(range(1, cMax), 'B구역'), 16);
                let R = mapToBlock(range(1,9), 'C구역');
                rows.push({ id: String(r), map: [...L, 'a', ...C, 'a', ...R] });
            }
            return rows;
        })()
    }
];

let state = { records: [], schedule: [] };

function loadData() {
    const savedData = localStorage.getItem('evan_tracker_v1');
    if (savedData) {
        state = JSON.parse(savedData);
    }
}

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

function renderStats() {
    const validRecords = getValidRecords();
    const scheduleRecords = state.schedule || []; 
    
    const totalCount = validRecords.length;
    const totalScheduleCount = scheduleRecords.length;
    
    const totalEl = document.getElementById('board-total');
    if (totalEl) totalEl.textContent = totalCount;

    const overallTotalEl = document.getElementById('board-total-schedule');
    if (overallTotalEl) overallTotalEl.textContent = `/ ${totalScheduleCount}`;

    CONFIG.ROLES.forEach((role, idx) => {
        const castKey = `cast${idx + 1}`;
        role.actors.forEach(actor => {
            const count = validRecords.filter(r => r[castKey] === actor).length;
            const totalCnt = scheduleRecords.filter(s => s[castKey] === actor).length; 
            
            const safeActorId = actor.replace(/\s+/g, '');
            const actorEl = document.getElementById(`count-${safeActorId}`);
            const actorTotalEl = document.getElementById(`total-${safeActorId}`);
            
            if (actorEl) {
                actorEl.textContent = count > 0 ? count : '0';
                if(count === 0) actorEl.style.color = '#94a3b8';
                else actorEl.style.color = '#e11d48'; 
            }
            
            if (actorTotalEl) {
                actorTotalEl.textContent = `/ ${totalCnt}`;
            }
        });
    });

    renderFinaleSeatMap(validRecords);
}

function renderFinaleSeatMap(validRecords) {
    let seatMap = {};
    
    validRecords.forEach(r => {
        if(r.seatZone && r.seatRow !== "" && r.seatNum !== "") {
            const k = `${r.seatZone}-${r.seatBlock || ''}-${r.seatRow.toUpperCase()}-${r.seatNum}`;
            seatMap[k] = (seatMap[k] || 0) + 1;
        }
    });

    const getHeatClass = (cnt) => {
        if(cnt >= 4) return 'c4';
        if(cnt === 3) return 'c3';
        if(cnt === 2) return 'c2';
        if(cnt === 1) return 'c1';
        return 'c0'; 
    };

    THEATER_ZONES.forEach((z) => {
        let hmHtml = '<div class="f-zone-col">';
        z.rows.forEach(rowInfo => {
            hmHtml += `<div class="f-seat-row">`;
            rowInfo.map.forEach(colObj => {
                if (colObj === 'a') {
                    hmHtml += `<div class="f-seat-aisle"></div>`;
                } else if (colObj === 'h') {
                    hmHtml += `<div class="f-seat-half"></div>`;
                } else if (colObj === null) {
                    hmHtml += `<div class="f-seat-cell hidden"></div>`;
                } else {
                    const k = `${z.name}-${colObj.b}-${rowInfo.id}-${colObj.n}`;
                    const cnt = seatMap[k] || 0;
                    hmHtml += `<div class="f-seat-cell ${getHeatClass(cnt)}"></div>`;
                }
            });
            hmHtml += `</div>`;
        });
        hmHtml += `</div>`;
        
        const targetId = z.name === '1층' ? 'seat-grid-1f' : (z.name === '2층' ? 'seat-grid-2f' : 'seat-grid-3f');
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.innerHTML = hmHtml;
    });
}

function downloadFinaleBoard() {
    window.scrollTo(0, 0);
    
    const captureArea = document.getElementById('finale-capture-area');
    const btn = document.getElementById('download-btn');
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '이미지 생성 중... ⏳';
    btn.disabled = true;

    // 🌟 가상 윈도우 크기를 강제로 지정하여 html2canvas 잘림 버그 완벽 차단
    html2canvas(captureArea, {
        scale: 2,           
        useCORS: true,      
        backgroundColor: null,
        width: captureArea.offsetWidth,
        height: captureArea.offsetHeight,
        windowWidth: captureArea.offsetWidth,
        windowHeight: captureArea.offsetHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0
    }).then(canvas => {
        let imgData = canvas.toDataURL("image/png");
        let link = document.createElement('a');
        let today = new Date().toISOString().slice(0,10);
        link.download = `Dear_Evan_Hansen_정산판_${today}.png`;
        link.href = imgData;
        link.click();
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }).catch(err => {
        console.error("이미지 생성 오류:", err);
        alert("이미지 저장에 실패했습니다.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

window.onload = () => {
    loadData();
    renderStats();
};
