const wrapColors = [["오프 화이트","WAU65"],["퓨어 화이트","WAP97"],["스노우 화이트","WAQ76"],["크림 화이트","WAR89"],["모노 화이트","WAU51"],["크리미","NO904"],["워시 베이지","AJ104"],["라이트 베이지","NCBS2"],["크레마","NO903"],["내추럴 오크","NO901"],["모던 그레이","KAFM8"],["모던 블랙","KDB86"],["어반 그레이","KAEC4"]];
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const steps = ['현장 유형','창호 목록','제품 선택','형태·치수','색상·구성','유리','핸들','전체 확인'];
const titles = ['어떤 현장인가요?','창호의 위치별 명칭을 모두 작성해주세요.','창호별 종류와 모델을 선택해주세요.','각 창의 형태와 치수를 입력해 주세요.','색상과 구성품을 선택해 주세요.','창호별 유리 사양을 정해 주세요.','핸들','현장 창호 정보를 한 번에 확인하세요.'];
const intros = ['개보수·아파트·비거주가 기본 선택입니다. 현장에 맞게 바꿔 주세요.','','','상담 치수와 제작 치수를 구별해 기록합니다. 도식은 입력한 비율에 맞춰 바뀝니다.','창호마다 필요한 방충망·배수홀 여부를 따로 정합니다.','','적용 가능한 부속과 위치는 실제 창 규격에 따라 달라질 수 있습니다.','비어 있거나 상담이 필요한 항목은 창호별로 표시됩니다.'];
let nextId = 1;
function makeWindow(name='') { return {id:String(nextId++),name,category:'',layers:'',model:'',shape:'',width:'',height:'',w1:'',quantity:'1',outside:'화이트',inside:'화이트',wrap:'',screen:'',drain:'',glassInnerOut:'',glassInnerIn:'',glassTypeOut:'',glassThicknessOut:'',glassGasOut:'',glassTypeIn:'',glassThicknessIn:'',glassGasIn:'',glassOut:'',glassIn:'',handle:'프리마/웜실버',lock:'자동(잠금)',handleSize:'',handleHeight:'',handleHeightManual:false,notes:''}; }
const site = {workType:'개보수',buildingType:'아파트',occupied:'비거주',removal:'철거 필요',name:'',address:'',measureAt:'',measureHour:'',installDate:'',memo:''};
const windows = [makeWindow()];
let step=2, focusId=windows[0].id, tab='spec';
const openIds=new Set([windows[0].id]);
function win(id){return windows.find(item=>item.id===id);}
function needsLayers(c){return ['발코니창','일반창'].includes(c.category);}
function modelOptions(c){
  if(c.category==='발코니창') return c.layers==='단창'?[['F-140','일반'],['F-145','고급']]:c.layers==='이중창'?[['F-250','일반'],['F-265','고급 · F-250 대비 약 8% 비쌈'],['F-285','베젤리스 · F-250 대비 약 13% 비쌈']]:[];
  if(c.category==='일반창') return c.layers==='단창'?[['F-130I','일반창 단창']]:c.layers==='이중창'?[['F-250I','일반창 이중창'],['F-270I','베젤리스']]:[];
  return {'분합창':[['F-230W','공간 분리 · 넓은 바(D)'],['F-230WF','플랫 · 낮은 하부틀']],'터닝도어':[['F-TD-140','실내 다용도 출입문']],'여닫이 창':[['F-SH60','사이드헝 · 외부로 열림'],['F-TH60','탑헝 · 외부로 열림']],'FIX창':[['CB90','통바 고정창'],['CB100','통바 고정창'],['F-130I','프레임 고정창']]}[c.category]||[];
}
function shapeOptions(c){if(c.category==='터닝도어')return ['미는문 좌손','미는문 우손','당기는문 좌손','당기는문 우손'];return c.category==='FIX창'?['FIX']:['2W 정_좌','2W 정_우',['2W U/B 좌','기본 1:2 비율'],['2W U/B 우','기본 1:2 비율'],['3W U/B','기본 1:2:1 비율']];}
function innerGlassOptions(c,side){if(c.category==='터닝도어'&&c['glassType'+side]==='투명(CL)')return ['투명(CL)','슈퍼로이(=싱글로이/SP)'];return !c['glassType'+side]?[]:c['glassType'+side].startsWith('더블로이')?['투명(CL)','미스트(ML)']:['투명(CL)','미스트(ML)','슈퍼로이(=싱글로이/SP)'];}
function syncGlass(c){
  if(c.category==='터닝도어')c.glassThicknessOut='24T';
  for(const side of ['Out','In']){
    if(!innerGlassOptions(c,side).includes(c['glassInner'+side]))c['glassInner'+side]='';
    c['glass'+side]=[c['glassThickness'+side]||'두께 미확정','외부 '+(c['glassType'+side]||'미확정'),'내부 '+(c['glassInner'+side]||'미확정'),c['glassGas'+side]||'충전 미확정'].join(' + ');
  }
}
function recommendedGlass(c,usage=''){
  if(c.category==='FIX창')return ['outside','inside'].includes(usage)?[{thickness:'26 mm',outer:usage==='outside'?'더블로이(KN/고단열)':'투명(CL)',inner:'투명(CL)',gas:usage==='outside'?'아르곤':'공기'}]:[];
  if(c.category==='터닝도어')return [{thickness:'24T',outer:'미스트(ML)',inner:'투명(CL)',gas:'공기'}];
  if(!['발코니창','일반창','분합창'].includes(c.category)||!['단창','이중창'].includes(c.layers))return [];
  const clear={thickness:'26 mm',outer:'투명(CL)',inner:'투명(CL)',gas:'공기'};
  const first=c.category==='발코니창'?{...clear,outer:'더블로이(KN/고단열)',gas:'아르곤'}:{...clear};
  return c.layers==='이중창'?[first,{...clear}]:[first];
}
function applyGlassRecommendation(c,usage=''){
  recommendedGlass(c,usage).forEach((spec,i)=>{const side=i===0?'Out':'In';c['glassThickness'+side]=spec.thickness;c['glassType'+side]=spec.outer;c['glassInner'+side]=spec.inner;c['glassGas'+side]=spec.gas;});
  syncGlass(c);
}
function glassSelect(c,key,label,values,disabled=false){return `<label>${label}<select data-field="${key}" data-id="${esc(c.id)}" ${disabled?'disabled':''}><option value="">${disabled?'외부 유리를 먼저 선택해 주세요':'선택해 주세요'}</option>${values.map(item=>{const [value,text]=Array.isArray(item)?item:[item,item];return `<option value="${esc(value)}" ${c[key]===value?'selected':''}>${esc(text)}</option>`;}).join('')}</select></label>`;}
function paneWidths(c){
  const W=Number(c.width)>0?Number(c.width):2300,three=c.shape==='3W U/B',ub=c.shape.includes('U/B');
  const w1=c.w1!==''?Number(c.w1):W/(three?4:3);
  if(c.shape==='FIX'||c.category==='터닝도어')return [W];
  if(three)return [w1,W-2*w1,w1];
  if(ub)return c.shape.includes('좌')?[w1,W-w1]:[W-w1,w1];
  return [W/2,W/2];
}
function shapeSvg(c){
  const W=Number(c.width)>0?Number(c.width):2300,H=Number(c.height)>0?Number(c.height):1900;
  const scale=Math.min(330/W,225/H),w=W*scale,h=H*scale,x=(480-w)/2+20,y=48+(225-h)/2;
  const widths=paneWidths(c),valid=widths.every(v=>Number.isFinite(v)&&v>0),panes=valid?widths:widths.map(()=>W/widths.length);
  const mains=c.shape==='3W U/B'?[0,2]:[c.shape.includes('좌')?0:panes.length-1],fix=c.shape==='FIX',door=c.category==='터닝도어';
  let out=`<svg viewBox="0 0 480 390" role="img" aria-label="${esc(c.shape)} 창 도식 가로 ${esc(c.width)} 세로 ${esc(c.height)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c.outside==='ASA 다크브라운'?'#574136':'#a8b3ac'}" stroke="#334c40" stroke-width="2"/>`;
  let offset=0;
  panes.forEach((p,i)=>{const pw=p*scale,center=x+offset+pw/2;
    out+=`<rect x="${x+offset+5}" y="${y+5}" width="${Math.max(1,pw-10)}" height="${Math.max(1,h-10)}" fill="${[c.glassTypeOut,c.glassInnerOut,...(c.layers==='이중창'?[c.glassTypeIn,c.glassInnerIn]:[])].includes('미스트(ML)')?'#dce5df':'#edf5f2'}" stroke="#597266"/>`;
    if(!fix&&!door&&mains.includes(i)){const size=Math.min(22,pw*.22,h*.18);out+=`<path data-main-pane="${i}" d="M${center-size} ${y+h/2-size/2} L${center} ${y+h/2+size} L${center+size} ${y+h/2-size/2}" fill="none" stroke="#185c39" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="${center}" y="${y+h/2-size-9}" text-anchor="middle" fill="#185c39" font-size="17" font-weight="700">주창</text>`;}
    if(c.shape==='3W U/B'&&valid)out+=`<text x="${center}" y="${y+h+24}" text-anchor="middle" font-size="17" fill="#244b35">${Math.round(widths[i]*100)/100}</text>`;
    if(c.screen==='포함'&&c.category!=='분합창'&&!fix&&!door&&mains.includes(i)){
      const size=Math.max(0,Math.min(45,pw-12,h-12)),left=x+offset+6,top=y+6;let mesh='';
      for(let n=0;n<=size;n+=5)mesh+=`M${left+n} ${top}v${size-n} M${left} ${top+n}h${size-n} `;
      out+=`<path data-screen-pane="${i}" d="${mesh}" fill="none" stroke="#334c40" stroke-width="1"/>`;
    }
    if(door){const leftHand=c.shape.includes('좌손'),hinge=leftHand?x+w-6:x+6,opposite=leftHand?x+6:x+w-6;out+=`<path data-door-diagonal="${leftHand?'left-hand':'right-hand'}" d="M${opposite} ${y+8}L${hinge} ${y+h/2}L${opposite} ${y+h-8}" fill="none" stroke="#597266" stroke-width="2" stroke-dasharray="${c.shape.startsWith('당기는')?'6 4':'none'}"/><rect data-door-handle="${leftHand?'left':'right'}" x="${leftHand?x+1:x+w-7}" y="${y+h/2-12}" width="6" height="24" rx="1" fill="#18251e"/><text x="${center}" y="${y+h/2+30}" text-anchor="middle" font-size="17" fill="#244b35">${esc(c.shape||'문 방향 선택')}</text>`;}
    if(c.shape.startsWith('2W U/B')&&valid&&mains.includes(i)){out+=`<path data-w1-line="true" d="M${x+offset} ${y+h+4}v16 M${x+offset+pw} ${y+h+4}v16 M${x+offset} ${y+h+14}h${pw}" fill="none" stroke="#708378"/><text x="${center}" y="${y+h+32}" text-anchor="middle" font-size="19" fill="#244b35">${Math.round(widths[i]*100)/100}</text>`;}
    offset+=pw;
  });
  out+=`<path d="M${x} ${y+h+40}H${x+w} M${x} ${y+h+34}v12 M${x+w} ${y+h+34}v12 M${x-28} ${y}V${y+h} M${x-34} ${y}h12 M${x-34} ${y+h}h12" fill="none" stroke="#708378"/>
    <text x="${x+w/2}" y="${y+h+68}" text-anchor="middle" fill="#244b35" font-size="22" font-weight="600">W ${esc(c.width||'—')} mm</text>
    <text x="${x-44}" y="${y+h/2}" transform="rotate(-90 ${x-44} ${y+h/2})" text-anchor="middle" fill="#244b35" font-size="22" font-weight="600">H ${esc(c.height||'—')} mm</text>`;
  if(c.shape.includes('U/B'))out+=`<text x="260" y="370" text-anchor="middle" font-size="17" fill="#244b35">${valid?'W1 '+(c.w1||Math.round(W/(c.shape==='3W U/B'?4:3)))+' mm'+(c.shape==='3W U/B'?' · 좌우 동일':''):'W1 값을 확인해 주세요'}</text>`;
  return out+'</svg>';
}
function options(key,selected,values,id='',wide=false){
  return `<div class="option-grid ${wide?'wide-options':''}">${values.map(value=>{const [label,desc,storedValue]=Array.isArray(value)?value:[value,''];const actual=storedValue??label;return `<button type="button" class="option ${selected===actual?'selected':''}" data-choice="${esc(key)}" data-value="${esc(actual)}" ${id?`data-id="${esc(id)}"`:''} ${key==='handleSize'&&actual==='대'&&Number(win(id)?.handleHeight)>0&&Number(win(id)?.handleHeight)<580?'disabled':''} aria-pressed="${selected===actual}">${esc(label)}${desc?`<small>${esc(desc)}</small>`:''}</button>`;}).join('')}</div>`;
}
function field(c,key,label,type='text',placeholder=''){
  return `<label>${esc(label)}<input type="${type}" data-field="${esc(key)}" data-id="${esc(c.id)}" value="${esc(c[key])}" ${type==='number'?(key==='handleHeight'?'min="0.5" step="0.5"':'min="1" step="1"'):''} placeholder="${esc(placeholder)}"></label>`;
}
function dateText(value){if(!value)return '';const [y,m,d]=value.split('-').map(Number);return value+' ('+'일월화수목금토'[new Date(y,m-1,d).getDay()]+')';}
function dateCaption(key){return dateText(site[key])||'날짜 선택';}
function refreshDates(){for(const key of ['measureAt','installDate']){const el=$('date-caption-'+key);if(el)el.textContent=dateCaption(key);}}
function dateField(key,label,time=false){return `<div class="date-field"><span>${label}</span><div class="direct-date-control"><div class="direct-date"><span id="date-caption-${key}" aria-hidden="true">${dateCaption(key)}</span><input class="native-date-overlay" type="date" data-site-field="${key}" value="${esc(site[key])}" aria-label="${label} 날짜 선택"></div>${time?`<select class="inline-hour" data-site-field="measureHour" aria-label="희망실측 시간"><option value="">시간 선택</option>${Array.from({length:14},(_,i)=>i+7).map(h=>`<option value="${h}" ${String(h)===site.measureHour?'selected':''}>${h}시</option>`).join('')}</select>`:''}</div></div>`;}
function siteField(key,label,type='text',placeholder=''){
  return `<label>${esc(label)}<input type="${type}" data-site-field="${esc(key)}" value="${esc(site[key])}" placeholder="${esc(placeholder)}"></label>`;
}
function select(c,key,label,values){
  return `<label>${esc(label)}<select data-field="${esc(key)}" data-id="${esc(c.id)}"><option value="">선택해 주세요</option>${values.map(value=>`<option value="${esc(value)}" ${c[key]===value?'selected':''}>${esc(value)}</option>`).join('')}</select></label>`;
}
function card(c,index,content){
  if(c.id!==focusId)return "";
  const missing=pending(c);
  return `<details class="window-card" data-card="${esc(c.id)}" open><summary><span>${index+1}. ${esc(c.name||'창위치명 미입력')}</span><span class="status ${missing.length?'pending':''}">${missing.length?`${missing.length}개 확인 필요`:'입력 완료'}</span></summary><div class="window-card-body">${content}</div></details>`;
}
function pending(c){
  const missing=[];
  const need=(value,label)=>{if(!value||String(value).includes('상담')||String(value).includes('미확정'))missing.push(label);};
  need(c.name.trim(),'창위치명');need(c.category,'창 종류');
  if(needsLayers(c))need(c.layers,'단창·이중창');
  need(c.model,'제품 모델');need(c.shape,'형태');
  for(const [key,label] of [['width','가로 W'],['height','세로 H'],['quantity','수량']]){const n=Number(c[key]);if(!Number.isInteger(n)||n<=0)missing.push(label);}
  if(c.shape.includes('U/B')&&c.w1){const n=Number(c.w1);if(!Number.isInteger(n)||n<=0||n*(c.shape==='3W U/B'?2:1)>=Number(c.width))missing.push('W1 치수');}

  if(c.inside==='시트랩핑')need(c.wrap,'랩핑 색상');
  if(!['터닝도어','FIX창','분합창'].includes(c.category))need(c.screen,'방충망');if(!['FIX창','분합창'].includes(c.category))need(c.drain,'배수홀');
  for(const side of c.layers==='이중창'?['Out','In']:['Out']){need(c['glass'+side],side==='In'?'안쪽 유리 사양':'유리 사양');}
  if(c.category!=='FIX창'&&!(c.handle==='별도상담 요청'&&c.category!=='터닝도어')){need(c.handle,'핸들 라인');need(c.lock,'핸들 종류');if(c.category!=='터닝도어'){need(c.handleSize,'핸들 크기');if(!c.handleHeight||!Number.isFinite(Number(c.handleHeight))||Number(c.handleHeight)<=0)missing.push('핸들 높이');}}
  if(c.handle==='별도상담 요청'&&!['터닝도어','FIX창'].includes(c.category))missing.push('핸들 별도상담');
  return [...new Set(missing)];
}
function sitePage(){
  return `<div class="question">현장정보</div><div class="field-grid">${siteField('name','현장명','text','예: oo디자인 oo아파트')}${siteField('address','현장주소','text','예: 경기 안양시 동안구 관악대로 279 대산아파트 111동 222호')}${dateField('measureAt','희망실측일',true)}${dateField('installDate','희망시공일')}</div>
  <div class="section-separator"></div><div class="question">1. 공사 구분</div>${options('workType',site.workType,['개보수','신축'])}
  <div class="question">2. 건물 유형</div>${options('buildingType',site.buildingType,['아파트','단독주택','주상복합','빌라','오피스텔','원룸','상업용 건물','기타'],'',true)}
  <div class="question">3. 시공 중 거주 여부</div>${options('occupied',site.occupied,['비거주','거주'])}
  <div class="question">4. 기존 창호 철거</div>${options('removal',site.removal,['철거 필요','철거 불필요','확인 필요'])}
  <p class="subtle">거주 중 시공과 철거는 현장 비용과 일정에 영향을 줄 수 있습니다. 신축은 설계도서의 창호 성능 조건도 확인해 주세요.</p>`;
}
function inventoryPage(){
  return `<div class="help">시공팀으로부터 전달받은 실측지 상의 명칭이 있으면 그대로 입력해주세요.</div>
  <div id="inventory">${windows.map((c,i)=>`<div class="inventory-row"><span class="row-number">${i+1}</span><label class="field">창위치명<input data-field="name" data-id="${esc(c.id)}" value="${esc(c.name)}" placeholder="예: 거실 발코니"></label><button type="button" class="danger" data-remove="${esc(c.id)}" ${windows.length===1?'disabled title="창호는 한 개 이상 필요합니다"':''}>삭제</button></div>`).join('')}</div>
  <div class="button-row" style="margin-top:16px"><button type="button" class="secondary" data-add="custom">+ 창호 직접 추가</button></div>`;
}
function productPage(){
  return windows.map((c,i)=>card(c,i,`<div class="small-heading">창 종류</div>${options('category',c.category,[['발코니창(외창)','외부용 (단창 140바, 145바 / 이중창 250바, 265바, 285바)','발코니창'],['일반창(내창)','내부용 (단창 130바 / 이중창 250바, 270바)','일반창'],['분합창(공틀단창)','공간 분리용 (230바)','분합창'],['터닝도어','여닫이 출입문'],['FIX창','고정창']],c.id)}
    ${needsLayers(c)?`<div class="small-heading">창구분</div>${options('layers',c.layers,[['단창','창 세트 한 겹'],['이중창','안·밖 두 겹']],c.id)}`:''}
    <div class="small-heading">LX 모델</div>${modelOptions(c).length?options('model',c.model,[...modelOptions(c)],c.id,true):'<p class="subtle">창 종류와 구성을 고르면 해당 후보가 나타납니다.</p>'}
`)).join('');
}
function dimensionPage(){
  return windows.map((c,i)=>card(c,i,`<div class="small-heading">창 모양</div>${options('shape',c.shape,shapeOptions(c),c.id,true)}
    <div class="field-grid three">${field(c,'width','전체 가로 W (mm)','number',c.category==='터닝도어'?'예: 900':'예: 2300')}${field(c,'height','전체 세로 H (mm)','number',c.category==='터닝도어'?'예: 2100':'예: 1900')}${c.shape.includes('U/B')?field(c,'w1','작은 창 부분 W1 (mm)','number','예: 900'):''}${field(c,'quantity','같은 사양 수량','number','1')}</div>
    <div class="mini-preview" id="preview-${esc(c.id)}">${shapeSvg(c)}</div>`)).join('');
}
function colorPage(){
  return windows.map((c,i)=>card(c,i,`<div class="small-heading">외부 색상</div>${options('outside',c.outside,(c.category==='터닝도어'?['화이트']:['화이트','ASA 다크브라운']),c.id)}
    <div class="small-heading">내부 색상</div>${options('inside',c.inside,['화이트',['시트랩핑','화이트 대비 약 6% 비쌈 (색상별 상이)']],c.id)}${c.inside==='시트랩핑'?`<div class="wrap-picker"><img class="wrap-chart" src="./wrapping-colors.png" alt="시트랩핑 13가지 색상 견본"><div class="small-heading">시트랩핑 색상 선택</div>${options('wrap',c.wrap,wrapColors.map(([name,code])=>[name,code,name+' ('+code+')']),c.id,true)}</div>`:''}
    ${!['터닝도어','FIX창','분합창'].includes(c.category)?'<div class="help" style="margin-top:18px">외창의 경우 주로 방충망+배수홀 적용<br>내창의 경우 방충망+배수홀이 필요한지 확인 후 선택</div>':''}${!['터닝도어','FIX창','분합창'].includes(c.category)?`<div class="small-heading">방충망</div>${options('screen',c.screen,['포함','미포함','상담 후 결정'],c.id)}`:''}
    ${!['FIX창','분합창'].includes(c.category)?`<div class="small-heading">배수홀</div>${options('drain',c.drain,c.category==='발코니창'?['적용 요청']:['적용 요청','미적용 요청','상담 후 결정'],c.id)}`:''}
    `)).join('');
}
function glassPage(){
  return windows.map((c,i)=>{
    const specs=recommendedGlass(c);
    const recommendation=c.category==='FIX창'?'<div class="fix-recommendations">'+[['outside','외부 픽스창'],['inside','내부 픽스창']].map(([usage,label])=>{const spec=recommendedGlass(c,usage)[0];return '<div class="help"><b>'+label+'</b><p>'+esc(spec.thickness+' · 외부 '+spec.outer+' + 내부 '+spec.inner+' · '+spec.gas)+'</p><button type="button" class="secondary" data-recommend="'+esc(c.id)+'" data-usage="'+usage+'">추천 사양 일괄 적용</button></div>';}).join('')+'</div><p class="help fix-notice">픽스창 규격이 너무 작을 경우, 아르곤 / 더블로이 등의 옵션이 적용불가할 수 있습니다.</p>':specs.length?`<div class="help"><b>${c.category==='일반창'?'일반창(내창)':c.category} ${c.layers||''} 추천 사양</b><br>${specs.map((spec,i)=>(specs.length===2?(i===0?'[유리(외)] ':'[유리(내)] '):'')+esc(spec.thickness+' · 외부 '+spec.outer+' + 내부 '+spec.inner+' · '+spec.gas)).join('<br>')}<br><button type="button" class="secondary" data-recommend="${esc(c.id)}" style="margin-top:10px">추천 사양 일괄 적용</button></div>`:'';
    const panes=(c.layers==='이중창'?['Out','In']:['Out']).map(side=>`<div class="small-heading">${c.layers==='이중창'?(side==='Out'?'[유리(외)]':'[유리(내)]'):'유리 옵션'}</div><div class="field-grid">
      ${c.category==='터닝도어'?'<label>유리 두께<select aria-label="유리 두께 24T 고정" disabled><option selected>24T</option></select></label>':glassSelect(c,'glassThickness'+side,'유리 두께',['24 mm',['26 mm','[추천] 26 mm'],'28 mm'])}
      ${glassSelect(c,'glassType'+side,'외부 유리',['투명(CL)','미스트(ML)','그린(GN)','더블로이(ND/고투과)',['더블로이(KN/고단열)',(c.category==='터닝도어'?'':'[추천] ')+'더블로이(KN/고단열)']])}
      <div>${glassSelect(c,'glassGas'+side,'유리 사이 충전',[['아르곤','[추천] 아르곤'],'공기'])}<p class="price-note">아르곤 선택 시 공기 충전 대비 약 1.5% 비쌈.</p></div>
      <div>${glassSelect(c,'glassInner'+side,'내부 유리',innerGlassOptions(c,side),!c['glassType'+side])}<p class="price-note">슈퍼로이는 더블로이보다 약 2% 비쌈. 성능·가격 면에서 더블로이를 추천합니다.</p></div></div>
      ${c['glassType'+side].startsWith('더블로이')?'<details class="glass-comparison"><summary>더블로이 색상·성능 비교 이미지 펼쳐보기</summary><img src="./double-low-e-colors.png" alt="더블로이 색상 비교"><img src="./double-low-e-performance.png" alt="더블로이 성능 비교표"></details>':''}`).join('');
    return card(c,i,recommendation+panes);
  }).join('');
}
function defaultHandle(c){return c.category==='터닝도어'?'일체형 웜실버':c.category==='분합창'?'자동커플(양방향)':c.category==='FIX창'?'':'자동(잠금)';}
function handleTypes(c){if(c.category==='FIX창')return [];if(c.category==='터닝도어')return ['일체형 웜실버'];return ['자동(잠금)',...(c.category==='분합창'||(c.category==='일반창'&&['F-130I','F-250I','F-270I'].includes(c.model))?['자동커플(양방향)']:[]),'단방향(무로드버튼/수동)'];}
function syncHardware(c){
  if(!handleTypes(c).includes(c.lock))c.lock=defaultHandle(c);
  if(['FIX창','터닝도어'].includes(c.category)){c.handleSize='';c.handleHeight='';c.handleHeightManual=false;return;}
  if(!c.handleHeightManual)c.handleHeight=Number(c.height)>0?String(Number(c.height)/2):'';
  if(Number(c.handleHeight)>0&&Number(c.handleHeight)<580)c.handleSize='중';
}
function hardwarePage(){
  windows.forEach(syncHardware);
  const image=win(focusId)?.category!=='FIX창'?'<div class="prima-reference" style="width:100%;max-width:864px;aspect-ratio:864/300;overflow:hidden;margin:0 auto 24px"><img src="./handle-lines.png" alt="프리마 라인 핸들 참고 이미지" style="display:block;width:100%;height:auto"></div>':'';
  return image+windows.map((c,i)=>c.id!==focusId?'':c.category==='FIX창'?`<div class="review-item"><h3>${i+1}. ${esc(c.name||'FIX창')}</h3><p>픽스창 핸들 없음</p></div>`:card(c,i,`${c.category!=='터닝도어'?`<div class="small-heading">핸들 라인</div>${options('handle',c.handle,['프리마/웜실버','별도상담 요청'],c.id)}`:''}
    <fieldset class="handle-options" ${c.handle==='별도상담 요청'&&c.category!=='터닝도어'?'disabled':''}><div class="small-heading">핸들 종류</div>${options('lock',c.lock,handleTypes(c),c.id)}
    ${c.category!=='터닝도어'?`<div class="small-heading">핸들 크기</div>${options('handleSize',c.handleSize,[['대','최소높이 580'],['중','최소높이 300']],c.id)}<div class="field-grid">${field(c,'handleHeight','핸들 높이 (mm) (기본위치 창호 중앙)','number','창호 세로 규격을 먼저 입력해 주세요')}</div>`:''}</fieldset>`)).join('');
}
function handleSummary(c){if(c.category==='FIX창')return '픽스창 핸들 없음';if(c.category==='터닝도어')return '핸들 종류: 일체형 웜실버';if(c.handle==='별도상담 요청')return '핸들: 별도상담 요청';return '핸들 라인: '+c.handle+' / '+(c.handleSize||'크기 확인')+' / 높이 '+(c.handleHeight?c.handleHeight+' mm':'미입력')+'\n핸들 종류: '+c.lock;}
function drawingFile(c,i){return '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="860" viewBox="0 0 480 430"><rect width="480" height="430" fill="white"/><text x="20" y="28" font-family="sans-serif" font-size="20">'+esc((i+1)+'. '+(c.name||'창위치명 미입력'))+'</text>'+shapeSvg(c).replace('<svg ','<svg x="0" y="40" width="480" height="390" ')+'</svg>';}
function safeDrawingName(value,fallback){return String(value||'').trim().replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/[. ]+$/g,'').slice(0,70)||fallback;}
function drawingName(c,i){return exportDatePrefix()+safeDrawingName(site.name,'현장-1')+'-'+safeDrawingName(c.name,'창호-'+(i+1))+'.jpg';}
async function loadDrawing(svg){const picture=new Image();await new Promise((resolve,reject)=>{picture.onload=resolve;picture.onerror=()=>reject(new Error('도식 읽기 실패'));picture.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});return picture;}
async function downloadDrawingCanvas(canvas,filename){
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.95));if(!blob||blob.type!=='image/jpeg')throw new Error('JPG 변환 실패');
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
async function saveDrawingJpg(id,button){
  const c=win(id);if(!c)return;button.disabled=true;
  try{const i=windows.indexOf(c),svg=drawingFile(c,i),filename=drawingName(c,i);const picture=await loadDrawing(svg);
    const canvas=document.createElement('canvas');canvas.width=960;canvas.height=860;const context=canvas.getContext('2d');if(!context)throw new Error('이미지 변환 불가');
    context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(picture,0,0,960,860);await downloadDrawingCanvas(canvas,filename);
  }catch(error){toast('JPG 저장에 실패했습니다. 다시 시도해 주세요.');}finally{button.disabled=false;}
}
async function saveAllDrawingsJpg(button){
  button.disabled=true;const original=button.textContent;button.textContent='그림 생성 중…';
  try{
    const items=windows.map((c,i)=>drawingFile(c,i)),siteName=site.name.trim()||'현장-1',filename=exportDatePrefix()+safeDrawingName(site.name,'현장-1')+'-전체창호.jpg';
    const columns=items.length===1?1:Math.max(2,Math.ceil(Math.sqrt(items.length/1.6))),rows=Math.ceil(items.length/columns);
    const cellW=960,cellH=860,gap=24,header=100,fullW=columns*cellW+(columns+1)*gap,fullH=rows*cellH+(rows+1)*gap+header;
    const scale=Math.min(1,16000/fullW,16000/fullH,Math.sqrt(40000000/(fullW*fullH)));
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(fullW*scale);canvas.height=Math.ceil(fullH*scale);const context=canvas.getContext('2d');if(!context)throw new Error('이미지 변환 불가');
    context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.scale(scale,scale);context.fillStyle='#244b35';context.font='bold 34px sans-serif';context.fillText(siteName+' · 전체 창호 ('+items.length+'종)',gap,62,fullW-2*gap);
    for(let i=0;i<items.length;i++){const picture=await loadDrawing(items[i]);context.drawImage(picture,gap+(i%columns)*(cellW+gap),header+gap+Math.floor(i/columns)*(cellH+gap),cellW,cellH);}
    await downloadDrawingCanvas(canvas,filename);
  }catch(error){toast('전체 창호 JPG 저장에 실패했습니다. 다시 시도해 주세요.');}finally{button.disabled=false;button.textContent=original;}
}
function drawingGallery(){return '<div class="drawing-grid">'+windows.map((c,i)=>`<figure class="drawing-item"><figcaption>${i+1}. ${esc(c.name||'창위치명 미입력')}</figcaption>${shapeSvg(c)}<button type="button" class="secondary" data-save-jpg="${esc(c.id)}">그림 저장 (JPG)</button></figure>`).join('')+'</div><div class="button-row" style="margin-top:24px"><button type="button" class="primary" data-save-all-jpg="true">창호그림 저장 (전체 JPG)</button></div>';}
function shortSpec(c){return [c.category,c.layers,c.model,c.shape].filter(Boolean).join(' · ')||'제품 미선택';}
function sitePending(){const missing=[];if(!site.name.trim())missing.push('현장명');if(!site.address.trim())missing.push('현장주소');if(site.removal==='확인 필요')missing.push('기존 창호 철거');return missing;}
function summary(full=true){
  let out=`[대산 LX창호 ${full?'선택 사양 상세':'상담 요청'}]\n현장명: ${site.name||'미입력'}\n현장주소: ${site.address||'미입력'}\n현장 유형: ${site.workType} · ${site.buildingType} · ${site.occupied}\n철거: ${site.removal}\n희망실측일: ${site.measureAt?dateText(site.measureAt)+(site.measureHour?' '+site.measureHour+'시':' / 시간 미선택'):'상담'}\n희망시공일: ${dateText(site.installDate)||'상담'}\n창호 ${windows.length}종 / 수량 합계 ${windows.reduce((n,c)=>n+(Number(c.quantity)>0?Number(c.quantity):0),0)}개\n`;
  windows.forEach((c,i)=>{
    const missing=pending(c);
    out+=`\n━━ ${i+1}. ${c.name||'창위치명 미입력'} ━━\n${shortSpec(c)}\nW×H: ${c.width||'미입력'} × ${c.height||'미입력'} mm${c.shape.includes('U/B')?` / W1: ${c.w1||(Number(c.width)>0?Math.round(Number(c.width)/(c.shape==='3W U/B'?4:3)):'미입력')} mm${c.shape==='3W U/B'?' (좌우 동일)':''}`:''} / ${c.quantity||'미입력'}개\n`;
    if(full){out+=`색상(외/내): ${c.outside||'상담'} / ${c.inside==='시트랩핑'?c.wrap||'랩핑 색상 상담':c.inside||'상담'}\n방충망: ${['터닝도어','FIX창','분합창'].includes(c.category)?'해당 없음':c.screen||'상담'} / 배수홀: ${['FIX창','분합창'].includes(c.category)?'해당 없음':c.drain||'상담'}\n${c.layers==='이중창'?'바깥쪽':'선택한 창'} 유리: ${c.glassOut||'사양 확인 필요'}${c.layers==='이중창'?'\n안쪽 유리: '+(c.glassIn||'사양 확인 필요'):''}\n${handleSummary(c)}\n`;}
    if(c.notes)out+='비고: '+c.notes+'\n';
    if(missing.length)out+=`확인 필요: ${missing.join(', ')}\n`;
  });
  return out+`\n현장 확인 필요: ${sitePending().join(', ')||'시공 조건 최종 검수'}\n현장 추가 요청: ${site.memo||'없음'}\n※ 상담 정보입니다. 대산이 치수·형태·방향·모델별 사양·시공 조건을 확인한 뒤 실제 견적과 발주를 확정합니다.`;
}
function approveIncompleteExport(){return !(sitePending().length||windows.some(c=>pending(c).length)||numericError())||window.confirm('아직 확인되지 않은 창호정보가 있어 실제 상세 견적진행이 어려울 수 있습니다. 그냥 진행하시겠습니까?');}
function jumpToMissing(id,label){
  const c=win(id);if(!c)return;const targets={'창위치명':[1,'name'],'창 종류':[2,'category'],'단창·이중창':[2,'layers'],'제품 모델':[2,!c.category?'category':needsLayers(c)&&!c.layers?'layers':'model'],'형태':[3,'shape'],'가로 W':[3,'width'],'세로 H':[3,'height'],'수량':[3,'quantity'],'W1 치수':[3,'w1'],'랩핑 색상':[4,'wrap'],'방충망':[4,'screen'],'배수홀':[4,'drain'],'핸들 별도상담':[6,'handle'],'핸들 라인':[6,'handle'],'핸들 종류':[6,'lock'],'핸들 크기':[6,'handleSize'],'핸들 높이':[6,'handleHeight']};
  let target=targets[label];if(label==='유리 사양'||label==='안쪽 유리 사양'){const side=label==='안쪽 유리 사양'?'In':'Out';target=[5,['glassThickness','glassType','glassInner','glassGas'].map(key=>key+side).find(key=>!c[key])||'glassThickness'+side];}
  if(!target)return;focusId=id;openIds.add(id);step=target[0];render();focusMissingControl(document.querySelector('[data-id="'+id+'"][data-field="'+target[1]+'"], [data-id="'+id+'"][data-choice="'+target[1]+'"]'));
}
function focusMissingControl(el){if(!el)return;el.focus({preventScroll:true});el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('missing-target');setTimeout(()=>el.classList.remove('missing-target'),2200);}
function reviewPage(){
  const issues=windows.map(c=>({c,missing:pending(c)}));
  const missingSite=sitePending();
  return `<div class="${issues.some(x=>x.missing.length)||missingSite.length?'warn':'help'}">${issues.some(x=>x.missing.length)||missingSite.length?'견적 진행 전 확인할 항목이 있습니다. 아래 창호별 목록을 확인해 주세요.':'입력 항목이 채워졌습니다. 대산에서 실제 제품 적용·실측·시공 조건을 최종 확인합니다.'}${missingSite.length?`<br>현장: ${missingSite.map(m=>`<button type="button" class="missing-link" data-site-missing="${esc(m)}">${esc(m)}</button>`).join(' · ')}`:''}</div>
  <div class="review-grid" style="margin-top:18px">${issues.map(({c,missing},i)=>`<div class="review-item"><h3>${i+1}. ${esc(c.name||'창위치명 미입력')}</h3><div class="review-preview">${shapeSvg(c)}</div><p>${esc(shortSpec(c))}<br>${esc(c.width||'—')} × ${esc(c.height||'—')} mm · ${esc(c.quantity||'—')}개</p><span class="status ${missing.length?'pending':''}">${missing.length?`${missing.length}개 확인 필요`:'입력 완료'}</span>${missing.length?`<ul>${missing.map(m=>`<li><button type="button" class="missing-link" data-missing="${esc(m)}" data-id="${esc(c.id)}">${esc(m)}</button></li>`).join('')}</ul>`:''}<div class="button-row" style="margin-top:12px"><button type="button" class="ghost" data-jump="${esc(c.id)}">이 창 수정</button></div><label style="display:block;margin-top:14px">비고<textarea data-field="notes" data-id="${esc(c.id)}" placeholder="이 창의 특이사항이나 요청사항을 자유롭게 작성해 주세요">${esc(c.notes)}</textarea></label></div>`).join('')}</div>
  <div class="section-separator"></div><div class="field-grid"><label class="wide">현장 추가 상담 요청<textarea data-site-field="memo" placeholder="철거·실측·시공 일정 등">${esc(site.memo)}</textarea></label></div>
  <div class="tabs" role="tablist"><button type="button" role="tab" data-tab="drawings" aria-selected="${tab==='drawings'}" class="${tab==='drawings'?'active':''}">창호 그림 모음</button><button type="button" role="tab" data-tab="spec" aria-selected="${tab==='spec'}" class="${tab==='spec'?'active':''}">선택 사양 상세</button></div>
  ${tab==='drawings'?drawingGallery():`<div id="spec-report">${specReport()}</div><div class="button-row report-downloads"><button type="button" class="primary" data-report="xlsx">정리본 엑셀 저장</button><button type="button" class="secondary" data-report="jpg">정리본 그림 저장 (JPG)</button></div><div class="button-row"><button type="button" class="yellow" data-action="share">카카오톡 전송</button><button type="button" class="primary" data-action="copy">정리본 복사</button></div>
  <p class="subtle" style="margin-top:12px">공유 목록에서 카카오톡을 선택하거나 정리본 그림을 복사해 대화창에 붙여넣으세요. 이미지 공유·복사를 지원하지 않는 브라우저에서는 그림파일을 저장합니다.</p>`}`;
}
let plannerZoom=1;
function renderSide(){
  $('window-count').textContent=`${windows.length}`;
  $('project-title').textContent=site.name||'새 현장';
  $('window-nav').innerHTML=windows.map((c,i)=>{const count=pending(c).length;return `<button type="button" class="window-nav ${c.id===focusId?'active':''}" data-focus="${esc(c.id)}" aria-pressed="${c.id===focusId}"><span class="window-thumb" aria-hidden="true">${shapeSvg(c)}</span><span class="window-info"><strong>${esc(c.name||'창호 '+(i+1))}</strong><small>${esc(c.model||'제품 선택 전')} · ${c.quantity||1}개</small><span class="list-status ${count?'':'complete'}">${count?'사양 입력 중':'입력 완료'}</span></span></button>`;}).join('');
  const c=win(focusId)||windows[0];
  $('diagram').innerHTML=shapeSvg(c);$('diagram').style.transform=`scale(${plannerZoom})`;
  $('preview-caption').textContent=c.shape?`${c.shape} · 개폐 방향은 발주 전 확인`:'상세 입력에서 제품과 형태를 선택해 주세요. 예시 비율로 표시됩니다.';
  $('stage-title').textContent=c.name||'창호 '+(windows.indexOf(c)+1);
  const missing=pending(c);$('stage-status').textContent=missing.length?`${missing.length}개 확인 필요`:'입력 완료';$('stage-status').className='status '+(missing.length?'pending':'');
  const details=[['제품', [c.category,c.model].filter(Boolean).join(' · ')||'미선택'],['규격',`${c.width||'—'} × ${c.height||'—'} mm`],['색상',c.inside==='시트랩핑'?c.wrap||'랩핑 선택 중':c.inside],['수량',`${c.quantity||'—'}개`]];
  $('stage-spec').innerHTML=details.map(([k,v])=>`<div><span>${k}</span><strong>${esc(v)}</strong></div>`).join('');
  document.querySelector('[data-planner="delete"]').disabled=windows.length===1;
}
function render(){
  document.body.dataset.mode=step===7?'review':step<2?'site':'configure';
  document.querySelectorAll('.workspace-modes button').forEach(b=>b.setAttribute('aria-current',Number(b.dataset.step)===(step<2?0:step===7?7:2)?'page':'false'));
  $('stepnav').innerHTML=steps.map((label,i)=>i<2||i===7?'':`<button type="button" data-step="${i}" ${i===step?'aria-current="step"':''}><span>${label.replace('제품 선택','제품').replace('색상·구성','색상')}</span></button>`).join('');
  const pages=[sitePage,inventoryPage,productPage,dimensionPage,colorPage,glassPage,hardwarePage,reviewPage];
  const headings=['현장 정보를 입력하세요','창호 목록 편집','어떤 창을 설치할까요?','형태와 치수를 정해주세요','색상과 구성을 골라주세요','유리 사양을 선택하세요','핸들을 선택하세요','상담 사양을 확인하세요'];
  const c=win(focusId);const nameField=step===2?`<div class="editor-name">${field(c,'name','창 위치명','text','예: 거실 발코니')}</div>`:'';
  $('wizard').innerHTML=`<div class="eyebrow">${step<2?'PROJECT':step===7?'REVIEW':'CONFIGURE / '+String(step-1).padStart(2,'0')}</div><h2>${headings[step]}</h2>${nameField}${pages[step]()}<div class="error" id="error" role="alert"></div><div class="actions"><button type="button" class="secondary" data-action="back" ${step===0?'disabled':''}>이전</button>${step<steps.length-1?'<button type="button" class="primary" data-action="next">'+(step===6?'전체 확인':'다음 항목')+' →</button>':''}</div>`;
  renderSide();installGuides();if(step===7)reportImageBlob().catch(()=>{});
}
function numericError(){
  for(const c of windows){
    if(c.handle!=='별도상담 요청'&&c.handleHeight!==''&&(!Number.isFinite(Number(c.handleHeight))||Number(c.handleHeight)<=0))return '핸들 높이는 0보다 큰 값으로 입력해 주세요.';
    for(const key of ['width','height','w1','quantity']){
      if(c[key]!==''&&(!Number.isInteger(Number(c[key]))||Number(c[key])<=0))return `${c.name||'창호'}: 규격과 수량은 1 이상의 정수로 입력해 주세요.`;
    }
    if(c.shape==='3W U/B'&&c.w1&&c.width&&Number(c.w1)*2>=Number(c.width))return `${c.name||'창호'}: 양쪽 W1의 합은 전체 가로 W보다 작아야 합니다.`;
    if(c.w1&&c.width&&Number(c.w1)>=Number(c.width))return `${c.name||'창호'}: W1은 전체 가로 W보다 작아야 합니다.`;
  }
  return '';
}
function go(n){
  if(n<0||n>=steps.length)return;
  if(steps[step]==='형태·치수'&&n>step){const error=numericError();if(error){$('error').textContent=error;return;}}
  step=n;render();$('wizard').scrollIntoView({block:'start'});
}
function toast(message){
  const target=$('toast');target.className='toast';target.textContent=message;
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>{target.className='';target.textContent='';},4200);
}
async function copySummary(){
  const promise=reportImageBlob();try{if(!navigator.clipboard?.write||typeof ClipboardItem==='undefined'){await imageFallback(await promise);return;}await navigator.clipboard.write([new ClipboardItem({'image/png':promise})]);toast('정리본 그림을 복사했습니다. 카카오톡 대화창에 붙여넣어 주세요.');}catch(error){try{await imageFallback(await promise);}catch(_){toast('그림 생성에 실패했습니다. 다시 시도해 주세요.');}}
}
async function shareSummary(){
  try{const blob=await reportImageBlob(),file=new File([blob],exportDatePrefix()+safeDrawingName(site.name,'현장-1')+'-창호상세내역.png',{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'대산 창호 발주서'});return;}catch(error){if(error.name==='AbortError')return;}}await imageFallback(blob);}catch(error){toast('그림 생성에 실패했습니다. 다시 시도해 주세요.');}
}
document.addEventListener('click',event=>{
  if(event.target.matches?.('.native-date-overlay')){try{event.target.showPicker?.();}catch(_){}return;}
  const button=event.target.closest('button');if(!button||button.matches(':disabled'))return;
  if(button.dataset.zoom!==undefined){plannerZoom=button.dataset.zoom==='0'?1:Math.max(.7,Math.min(1.4,plannerZoom+Number(button.dataset.zoom)*.1));$('zoom-label').textContent=Math.round(plannerZoom*100)+'%';$('diagram').style.transform=`scale(${plannerZoom})`;return;}
  if(button.dataset.planner==='duplicate'){const c={...win(focusId),id:String(nextId++),name:(win(focusId).name||'창호')+' 복사'};windows.push(c);focusId=c.id;openIds.add(c.id);render();toast('같은 사양의 창호를 복제했습니다.');return;}
  if(button.dataset.planner==='delete'){if(windows.length<=1)return;const c=win(focusId);if(!window.confirm(`${c.name||'선택한 창호'}를 삭제할까요?`))return;windows.splice(windows.indexOf(c),1);openIds.delete(c.id);focusId=windows[0].id;render();return;}
  if(button.dataset.planner==='demo'){
    if((site.name||site.address||windows.some(c=>c.name||c.category||c.width))&&!window.confirm('현재 입력을 예시 상담으로 바꿀까요? 저장하지 않은 내용은 사라집니다.'))return;
    Object.assign(site,{workType:'개보수',buildingType:'아파트',occupied:'비거주',removal:'철거 필요',name:'샘플 · 아파트 창호 상담',address:'예시 현장 (실제 고객 정보 아님)',measureAt:'',measureHour:'',installDate:'',memo:''});
    windows.splice(0);openIds.clear();
    [['거실 발코니','발코니창','F-250','이중창','3200','2200'],['안방','일반창','F-130I','단창','1800','1500'],['작은방','일반창','F-130I','단창','1500','1500']].forEach(([name,category,model,layers,width,height])=>{const c=makeWindow(name);Object.assign(c,{category,model,layers,width,height,shape:'2W 정_좌',screen:category==='발코니창'?'포함':'미포함',drain:category==='발코니창'?'적용 요청':'미적용 요청',handleSize:'대'});applyGlassRecommendation(c);syncHardware(c);windows.push(c);openIds.add(c.id);});
    focusId=windows[0].id;step=3;render();toast('가상의 예시 상담입니다. 자유롭게 사양을 바꿔보세요.');return;
  }
  if(button.dataset.missing){jumpToMissing(button.dataset.id,button.dataset.missing);return;}
  if(button.dataset.siteMissing){step=0;render();const key={'현장명':'name','현장주소':'address','기존 창호 철거':'removal'}[button.dataset.siteMissing];focusMissingControl(document.querySelector('[data-site-field="'+key+'"], [data-choice="'+key+'"]'));return;}
  if(button.dataset.report){if(approveIncompleteExport())saveSpecReport(button.dataset.report,button);return;}
  if(button.dataset.saveAllJpg){if(approveIncompleteExport())saveAllDrawingsJpg(button);return;}
  if(button.dataset.saveJpg){saveDrawingJpg(button.dataset.saveJpg,button);return;}
  if(button.dataset.step!==undefined){go(Number(button.dataset.step));return;}
  if(button.dataset.choice){
    const {choice:key,value,id}=button.dataset;
    if(id){
      const c=win(id);if(!c)return;
      if(c.category==='발코니창'&&key==='drain'&&value!=='적용 요청')return;
      c[key]=value;focusId=id;openIds.add(id);
      if(key==='category'){c.lock=defaultHandle(c);c.screen=value==='발코니창'?'포함':['일반창','터닝도어'].includes(value)?'미포함':'';c.drain=value==='발코니창'?'적용 요청':['일반창','터닝도어'].includes(value)?'미적용 요청':'';if(value==='터닝도어')c.outside='화이트';c.model=value==='터닝도어'?'F-TD-140':'';c.shape=value==='FIX창'?'FIX':'';c.w1='';c.layers=value==='분합창'?'단창':'';for(const side of ['Out','In']){c['glassType'+side]='';c['glassInner'+side]='';c['glassThickness'+side]='';c['glassGas'+side]='';}syncGlass(c);}
      if(key==='layers'){c.model=c.category==='일반창'&&value==='단창'?'F-130I':'';c.glassIn='';c.glassTypeIn='';c.glassInnerIn='';c.glassThicknessIn='';c.glassGasIn='';syncGlass(c);}
      if(key==='model'&&c.category==='여닫이 창')c.shape='';
      if(key==='shape'&&!value.includes('U/B'))c.w1='';
      if(key==='inside'&&value!=='시트랩핑')c.wrap='';
      if(key.startsWith('glass'))syncGlass(c);
      if(['category','layers','model'].includes(key))syncHardware(c);

    }else {site[key]=value;if(key==='workType')site.removal=value==='신축'?'철거 불필요':'철거 필요';}
    render();if(id)revealNextGuide(id,key==='shape');return;
  }
  if(button.dataset.add!==undefined){
    
    const c=makeWindow();windows.push(c);focusId=c.id;openIds.add(c.id);if(step!==1)step=2;render();return;
  }
  if(button.dataset.remove){
    if(windows.length<=1)return;
    const c=win(button.dataset.remove);if(!c)return;
    if((c.model||c.width||c.glassOut)&&!window.confirm(`${c.name} 정보를 목록에서 삭제할까요?`))return;
    windows.splice(windows.indexOf(c),1);openIds.delete(c.id);if(focusId===c.id)focusId=windows[0].id;render();return;
  }
  if(button.dataset.focus){
    focusId=button.dataset.focus;openIds.add(focusId);if(step<2||step===7)step=2;render();return;
  }
  if(button.dataset.recommend){const c=win(button.dataset.recommend);if(c){focusId=c.id;openIds.add(c.id);applyGlassRecommendation(c,button.dataset.usage);render();}return;}
  if(button.dataset.jump){focusId=button.dataset.jump;openIds.add(focusId);go(2);return;}
  if(button.dataset.tab){tab=button.dataset.tab;render();return;}
  if(button.dataset.action==='back'){go(step-1);return;}
  if(button.dataset.action==='next'){go(step+1);return;}
  if(button.dataset.action==='copy'){if(approveIncompleteExport())copySummary();return;}
  if(button.dataset.action==='share'){if(approveIncompleteExport())shareSummary();return;}
});
document.addEventListener('input',event=>{
  const target=event.target;
  if(target.dataset.siteField){site[target.dataset.siteField]=target.value;refreshDates();$('project-title').textContent=site.name||'새 현장';if($('spec-report'))$('spec-report').innerHTML=specReport();return;}
  if(!target.dataset.field)return;
  const c=win(target.dataset.id);if(!c)return;
  c[target.dataset.field]=target.value;focusId=c.id;
  if(target.dataset.field==='handleHeight')c.handleHeightManual=target.value!=='';
  if(['height','handleHeight'].includes(target.dataset.field)){syncHardware(c);refreshHandleControls(c);}
  if(target.dataset.field.startsWith('glass')&&!['glassOut','glassIn'].includes(target.dataset.field))syncGlass(c);
  if(target.dataset.field==='privacySide')syncGlass(c);
  renderSide();
  updateGuides();
  const preview=$('preview-'+c.id);if(preview)preview.innerHTML=shapeSvg(c);
  if($('spec-report'))$('spec-report').innerHTML=specReport();
});
document.addEventListener('change',event=>{
  const target=event.target;
  if(target.dataset.siteField){site[target.dataset.siteField]=target.value;refreshDates();$('project-title').textContent=site.name||'새 현장';if($('spec-report'))$('spec-report').innerHTML=specReport();return;}
  if(target.dataset.field&&target.tagName==='INPUT'){updateGuides();revealNextGuide(target.dataset.id);}
  if(target.dataset.field&&target.tagName==='SELECT'){
    const c=win(target.dataset.id);if(!c)return;c[target.dataset.field]=target.value;
    if(target.dataset.field.startsWith('glass')||target.dataset.field==='privacySide')syncGlass(c);
    focusId=c.id;openIds.add(c.id);render();
  }
});
document.addEventListener('focusin',event=>{
  const id=event.target.dataset?.id;if(id&&win(id)&&id!==focusId){focusId=id;renderSide();}
});
document.addEventListener('toggle',event=>{
  if(!event.target.matches?.('[data-card]'))return;
  const id=event.target.dataset.card;if(event.target.open)openIds.add(id);else openIds.delete(id);
},true);
render();

const masthead=document.getElementById('app-masthead');
if(masthead){const resizeMasthead=()=>document.documentElement.style.setProperty('--masthead-height',Math.ceil(masthead.getBoundingClientRect().height)+'px');resizeMasthead();if(typeof ResizeObserver!=='undefined')new ResizeObserver(resizeMasthead).observe(masthead);else window.addEventListener('resize',resizeMasthead);}

document.addEventListener('keydown',event=>{if(event.key==='Enter'&&step===3&&event.target.matches('input[data-field]')){event.preventDefault();updateGuides();revealNextGuide(event.target.dataset.id,true);}});

function refreshHandleControls(c){document.querySelectorAll('[data-choice="handleSize"][data-id="'+c.id+'"]').forEach(button=>{button.disabled=button.dataset.value==='대'&&Number(c.handleHeight)>0&&Number(c.handleHeight)<580;button.classList.toggle('selected',button.dataset.value===c.handleSize);button.setAttribute('aria-pressed',String(button.dataset.value===c.handleSize));});const input=document.querySelector('[data-field="handleHeight"][data-id="'+c.id+'"]');if(input&&input.value!==c.handleHeight)input.value=c.handleHeight;}
document.addEventListener('keydown',event=>{if(event.key!=='Enter'||event.isComposing||event.keyCode===229||step!==1||!event.target.matches('input[data-field="name"]'))return;event.preventDefault();const inputs=[...document.querySelectorAll('input[data-field="name"]')],next=inputs[inputs.indexOf(event.target)+1];if(next){next.focus({preventScroll:true});next.select();next.scrollIntoView({block:'center',behavior:'smooth'});}});
