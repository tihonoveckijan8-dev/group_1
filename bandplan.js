/* ═══ SECTION 9: SONGS ═══ */
const GENRES=['Worship','Hymn','Rock','Pop','Ballad','Jazz','Folk','Electronic','Gospel','Other'];
const TIME_SIGNATURES=['4/4','3/4','6/8','2/4','5/4','7/8','12/8'];
const SONG_TPL='[Verse 1]\nG       C       D       G\nПервая строка текста\nG       D       C       G\nВторая строка текста\n\n[Chorus]\nC       G       D       Em\nСтрока припева\nC       D       G\nЗавершающая строка';
function renderSongs(){
  const st=State.ui.songs;
  const dd='<div class="filter-section"><div class="filter-title">Поиск</div>'+
      '<div class="filter-search-inline">'+icon('search',16)+'<input type="search" id="songSearch" placeholder="Название, исполнитель, автор, текст, тег…" value="'+escapeHtml(st.query)+'" aria-label="Поиск песен"></div></div>'+
    '<div class="filter-section"><div class="filter-title">Подборка</div><div class="filter-chips" id="songFilterChips">'+
      [['all','Все'],['favorite','★ Избранные'],['recent','Недавние'],['az','А–Я']].map(f=>
        '<label class="chip'+(st.filter===f[0]?' active':'')+'"><input type="radio" name="songFilterRadio" value="'+f[0]+'"'+(st.filter===f[0]?' checked':'')+'>'+f[1]+'</label>').join('')+'</div></div>'+
    '<div class="filter-section"><div class="filter-title">Сортировка</div><select class="form-select" id="songSort">'+
      [['updated','Сначала изменённые'],['created','Сначала новые'],['title','По названию'],['artist','По исполнителю'],['key','По тональности'],['bpm','По темпу']].map(o=>
        '<option value="'+o[0]+'"'+(st.sort===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>'+
    '<div class="filter-section"><div class="filter-title">Группа</div><select class="form-select" id="songGroupFilter"><option value="">Все группы</option>'+
      State.groups.map(g=>'<option value="'+g.id+'"'+(st.group===g.id?' selected':'')+'>'+escapeHtml(g.name)+'</option>').join('')+'</select></div>'+
    '<div class="filter-section"><div class="filter-title">Жанр</div><select class="form-select" id="songGenreFilter"><option value="">Все жанры</option>'+
      Array.from(new Set(GENRES.concat(State.songs.map(s=>s.genre).filter(Boolean)))).map(g=>'<option value="'+escapeHtml(g)+'"'+(st.genre===g?' selected':'')+'>'+escapeHtml(g)+'</option>').join('')+'</select></div>'+
    '<div class="form-row"><div class="filter-section"><div class="filter-title">Тональность</div><select class="form-select" id="songKeyFilter"><option value="">Любая</option>'+
      Array.from(new Set(State.songs.map(s=>s.key).filter(Boolean))).sort().map(k=>'<option value="'+escapeHtml(k)+'"'+(st.key===k?' selected':'')+'>'+escapeHtml(k)+'</option>').join('')+'</select></div>'+
    '<div class="filter-section"><div class="filter-title">Язык</div><select class="form-select" id="songLangFilter"><option value="">Любой</option>'+
      Array.from(new Set(State.songs.map(s=>s.language).filter(Boolean))).sort().map(l=>'<option value="'+escapeHtml(l)+'"'+(st.language===l?' selected':'')+'>'+escapeHtml(l)+'</option>').join('')+'</select></div></div>'+
    '<div class="filter-summary" id="songFilterSummary"></div>'+
    '<div class="filter-footer"><button class="btn btn-sm" type="button" data-act="reset-song-filters">Сбросить</button>'+
      '<button class="btn btn-sm btn-primary" type="button" data-act="close-filter" data-target="songFilterDropdown">Показать</button></div>';
  $('#content').innerHTML='<div class="page-header"><div><h1 class="page-title">Песни</h1>'+
      '<p class="page-subtitle" id="songsSubtitle">'+State.songs.length+' '+plural(State.songs.length,'песня','песни','песен')+' в каталоге</p></div>'+
    '<div class="page-actions">'+filterMenuHTML('songFilterDropdown',dd,songFilterCount())+
      '<button class="btn" type="button" data-act="toggle-select-mode">'+icon('check',18)+'Выбрать</button>'+
      '<button class="btn btn-primary" type="button" data-act="new-song">'+icon('plus',18)+'Песня</button></div></div>'+
    '<div id="selectionBar"></div><div id="songList" class="grid grid-2"></div>';
  const inp=$('#songSearch');
  if(inp)inp.addEventListener('input',debounce(()=>{st.query=inp.value;onSongFilter();},170),{passive:true});
  $$('#songFilterChips input').forEach(r=>r.addEventListener('change',()=>{st.filter=r.value;
    $$('#songFilterChips .chip').forEach(c=>c.classList.remove('active'));r.closest('.chip').classList.add('active');onSongFilter();},{passive:true}));
  ['songSort','songGroupFilter','songGenreFilter','songKeyFilter','songLangFilter'].forEach(idf=>{const elx=$('#'+idf);
    if(elx)elx.addEventListener('change',()=>{st.sort=$('#songSort').value;st.group=$('#songGroupFilter').value;
      st.genre=$('#songGenreFilter').value;st.key=$('#songKeyFilter').value;st.language=$('#songLangFilter').value;onSongFilter();},{passive:true});});
  updateSongSummary();renderSongList();renderSelectionBar();}
function onSongFilter(){setFilterCount('songFilterDropdown',songFilterCount());updateSongSummary();renderSongList();}
function updateSongSummary(){const el=$('#songFilterSummary');if(!el)return;const st=State.ui.songs,p=[];
  if(st.filter!=='all')p.push({favorite:'избранные',recent:'недавние',az:'по алфавиту'}[st.filter]||'');
  if(st.query)p.push('поиск: «'+st.query+'»');
  if(st.group)p.push('группа: '+groupName(st.group));
  if(st.genre)p.push('жанр: '+st.genre);
  if(st.key)p.push('тональность: '+st.key);
  if(st.language)p.push('язык: '+st.language);
  el.textContent=p.length?'Применено: '+p.join(' · '):'Фильтры не применены — показан весь каталог.';}
function filteredSongs(){const st=State.ui.songs;let list=State.songs.slice();
  if(st.filter==='favorite')list=list.filter(s=>s.favorite);
  if(st.group)list=list.filter(s=>(s.groupIds||[]).indexOf(st.group)>=0);
  if(st.genre)list=list.filter(s=>s.genre===st.genre);
  if(st.key)list=list.filter(s=>s.key===st.key);
  if(st.language)list=list.filter(s=>s.language===st.language);
  const q=(st.query||'').toLowerCase().trim();
  if(q)list=list.filter(s=>(s.title||'').toLowerCase().indexOf(q)>=0||(s.artist||'').toLowerCase().indexOf(q)>=0||(s.author||'').toLowerCase().indexOf(q)>=0||
    (s.key||'').toLowerCase().indexOf(q)>=0||(s.genre||'').toLowerCase().indexOf(q)>=0||(s.tags||[]).some(t=>String(t).toLowerCase().indexOf(q)>=0)||
    (s.lyrics||'').toLowerCase().indexOf(q)>=0);
  const cmp={updated:(a,b)=>new Date(b.updatedAt||0)-new Date(a.updatedAt||0),created:(a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0),
    title:(a,b)=>(a.title||'').localeCompare(b.title||'','ru'),artist:(a,b)=>(a.artist||a.author||'').localeCompare(b.artist||b.author||'','ru'),
    key:(a,b)=>(a.key||'zz').localeCompare(b.key||'zz'),bpm:(a,b)=>(b.bpm||0)-(a.bpm||0)}[st.sort]||((a,b)=>(a.title||'').localeCompare(b.title||'','ru'));
  list.sort(cmp);return list;}
function renderSongList(){const el=$('#songList');if(!el)return;const list=filteredSongs();
  const sub=$('#songsSubtitle');
  if(sub)sub.textContent=list.length+' '+plural(list.length,'песня','песни','песен')+(State.ui.songs.query?' по запросу «'+State.ui.songs.query+'»':'');
  if(!list.length){el.innerHTML='<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🎵</div>'+
    '<div class="empty-state-title">'+(State.songs.length?'Ничего не найдено':'В каталоге пока нет песен')+'</div>'+
    '<div class="empty-state-text">'+(State.songs.length?'Измените запрос или сбросьте фильтры.':'Добавьте первую песню: текст, аккорды, тональность, темп, динамику по инструментам и файлы.')+'</div>'+
    '<button class="btn btn-primary" data-act="'+(State.songs.length?'reset-song-filters':'new-song')+'">'+(State.songs.length?'Сбросить фильтры':icon('plus',18)+'Добавить песню')+'</button></div>';return;}
  renderChunked(el,list,songCardHTML,24);}
function songCardHTML(s){const chords=extractChords(s.lyrics),sel=State.ui.selection.has(s.id),dyn=dynRows(s).length;
  return '<article class="song-card'+(sel?' selected':'')+'" data-song="'+s.id+'" role="link" tabindex="0">'+
    (State.ui.selectMode?'<span class="select-check">'+(sel?'✓':'')+'</span>':'')+
    '<button class="song-fav'+(s.favorite?' active':'')+'" type="button" data-act="fav-song" data-id="'+s.id+'" aria-label="Избранное">'+(s.favorite?'★':'☆')+'</button>'+
    '<div class="song-card-title">'+escapeHtml(s.title)+'</div><div class="song-card-meta">'+
      (s.key?'<span>🔑 '+escapeHtml(s.key)+'</span>':'')+(s.bpm?'<span>🥁 '+s.bpm+'</span>':'')+
      (s.timeSignature?'<span>𝄴 '+escapeHtml(s.timeSignature)+'</span>':'')+
      (s.duration?'<span>'+icon('clock',13)+' '+durationLabel(s.duration)+'</span>':'')+
      ((s.artist||s.author)?'<span>✍️ '+escapeHtml(s.artist||s.author)+'</span>':'')+
      ((s.fileIds||[]).length?'<span>'+icon('paperclip',13)+' '+s.fileIds.length+'</span>':'')+'</div>'+
    '<div style="margin-top:10px;display:flex;gap:4px;flex-wrap:wrap">'+
      '<span class="song-badge">'+chords.length+' '+plural(chords.length,'аккорд','аккорда','аккордов')+'</span>'+
      (dyn?'<span class="song-badge">'+icon('sliders',12)+' динамика: '+dyn+'</span>':'')+
      (s.genre?'<span class="song-badge" style="background:var(--surface-3);color:var(--text-muted)">'+escapeHtml(s.genre)+'</span>':'')+
      (s.tags||[]).slice(0,3).map(t=>'<span class="song-badge" style="background:var(--surface-3);color:var(--text-muted)">'+escapeHtml(t)+'</span>').join('')+'</div></article>';}
function renderSelectionBar(){const el=$('#selectionBar');if(!el)return;const n=State.ui.selection.size;
  if(!State.ui.selectMode){el.innerHTML='';return;}
  el.innerHTML='<div class="selection-bar"><span class="selection-count">Выбрано: '+n+'</span>'+
    '<button class="btn btn-sm" type="button" data-act="select-all">Все</button>'+
    '<button class="btn btn-sm" type="button" data-act="bulk-print"'+(n?'':' disabled')+'>'+icon('print',15)+'Печать / PDF</button>'+
    '<button class="btn btn-sm" type="button" data-act="bulk-export"'+(n?'':' disabled')+'>'+icon('download',15)+'Экспорт</button>'+
    '<button class="btn btn-sm" type="button" data-act="bulk-setlist"'+(n?'':' disabled')+'>'+icon('list',15)+'В сет-лист</button>'+
    '<button class="btn btn-sm" type="button" data-act="bulk-fav"'+(n?'':' disabled')+'>★ Избранное</button>'+
    '<button class="btn btn-sm btn-danger" type="button" data-act="bulk-delete"'+(n?'':' disabled')+'>'+icon('trash',15)+'</button>'+
    '<button class="btn btn-sm" type="button" data-act="toggle-select-mode">Закрыть</button></div>';}
function renderSongDetail(songId){
  const song=findSong(songId);if(!song){Toast.error('Песня не найдена');navigate('#/songs');return;}
  const t=State.ui.transpose,displayKey=song.key?transposeKey(song.key,t):'—';
  const chords=extractChords(song.lyrics);
  const versions=State.songVersions.filter(v=>v.songId===song.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const usedIn=State.setlists.filter(sl=>(sl.items||[]).some(i=>i.songId===song.id));
  const groups=(song.groupIds||[]).map(findGroup).filter(Boolean);
  const dyn=dynamicsHTML(song);
  $('#content').innerHTML='<div class="page-header"><div>'+
      '<button class="btn btn-sm mb-2" data-go="#/songs">'+icon('arrowLeft',16)+'К каталогу</button>'+
      '<h1 class="page-title">'+escapeHtml(song.title)+'</h1>'+
      '<p class="page-subtitle">'+escapeHtml([song.artist||song.author,'Тональность: '+displayKey,song.bpm?song.bpm+' BPM':null,song.timeSignature,song.duration?durationLabel(song.duration):null].filter(Boolean).join(' · '))+'</p></div>'+
    '<div class="page-actions">'+
      '<button class="btn'+(song.favorite?' btn-primary':'')+'" type="button" data-act="fav-song" data-id="'+song.id+'" aria-label="Избранное">'+(song.favorite?'★':'☆')+'</button>'+
      '<button class="btn" type="button" data-act="song-to-setlist" data-id="'+song.id+'">'+icon('list',16)+'В сет-лист</button>'+
      '<button class="btn" type="button" data-act="print-preview-song" data-id="'+song.id+'">'+icon('print',16)+'Печать</button>'+
      '<button class="btn" type="button" data-act="export-song" data-id="'+song.id+'">'+icon('download',16)+'</button>'+
      '<button class="btn btn-primary" type="button" data-act="edit-song" data-id="'+song.id+'">'+icon('edit',16)+'Изменить</button></div></div>'+
    '<div class="card mb-4"><div class="flex items-center justify-between flex-wrap gap-2">'+
      '<div><h2 class="section-title" style="margin:0">Транспонирование</h2>'+
      '<div class="text-muted" style="font-size:13px;margin-top:4px">Оригинал: <strong>'+escapeHtml(song.key||'—')+'</strong> → сейчас: <strong>'+escapeHtml(displayKey)+'</strong></div></div>'+
      '<div class="transpose-controls"><button class="transpose-btn" type="button" data-act="transpose" data-d="-1" aria-label="Ниже">−</button>'+
      '<span class="transpose-value" aria-live="polite">'+(t>0?'+':'')+t+'</span>'+
      '<button class="transpose-btn" type="button" data-act="transpose" data-d="1" aria-label="Выше">+</button>'+
      '<button class="transpose-btn" type="button" data-act="transpose-reset" aria-label="Сбросить">↺</button></div></div>'+
      '<div class="flex gap-2 flex-wrap mt-4"><button class="btn btn-sm btn-primary" type="button" data-act="scene-from-song" data-id="'+song.id+'">'+icon('stage',16)+'На сцену</button>'+
      '<button class="btn btn-sm" type="button" data-act="scene-from-song-auto" data-id="'+song.id+'">▶ Автопрокрутка</button></div></div>'+
    '<section class="card mb-4"><h2 class="section-title">Текст и аккорды</h2>'+renderLyrics(song.lyrics,t)+'</section>'+
    '<section class="card mb-4"><div class="dyn-head"><h2 class="section-title" style="margin:0">Динамика по инструментам</h2>'+
      '<div class="dyn-actions"><button class="btn btn-sm" type="button" data-act="edit-song" data-id="'+song.id+'">'+icon('sliders',15)+'Расписать</button></div></div>'+
      (dyn?'<div class="dyn-legend mt-2">'+DYN_LEVELS.map(l=>'<span>'+l.l+' — '+l.t+'</span>').join('')+'</div>'+dyn
        :'<p class="text-muted mt-2" style="font-size:14px">Динамика не расписана. Нажмите «Расписать», чтобы назначить громкость каждому инструменту по секциям (куплет, припев, бридж).</p>')+'</section>'+
    (chords.length?'<section class="card mb-4"><h2 class="section-title">Используемые аккорды</h2><div class="chip-row">'+chords.map(c=>'<span class="song-badge" style="font-size:13px;padding:6px 12px">'+escapeHtml(transposeChord(c,t))+'</span>').join('')+'</div></section>':'')+
    '<section class="card mb-4"><h2 class="section-title">Карточка песни</h2>'+
      infoRow('Исполнитель / автор',escapeHtml(song.artist||song.author||'—'))+
      infoRow('Тональность',escapeHtml(song.key||'—'))+infoRow('Темп',song.bpm?song.bpm+' BPM':'—')+
      infoRow('Размер',escapeHtml(song.timeSignature||'—'))+infoRow('Жанр',escapeHtml(song.genre||'—'))+
      infoRow('Язык',escapeHtml(song.language||'—'))+infoRow('Длительность',durationLabel(song.duration))+
      infoRow('Теги',(song.tags||[]).length?song.tags.map(x=>'<span class="song-badge">'+escapeHtml(x)+'</span>').join(' '):'—')+
      infoRow('Группы',groups.length?groups.map(g=>'<a href="#/band/group/'+g.id+'" style="color:var(--accent)">'+escapeHtml(g.name)+'</a>').join(', '):'—')+
      infoRow('В сет-листах',usedIn.length?usedIn.map(sl=>'<a href="#/band/setlist/'+sl.id+'" style="color:var(--accent)">'+escapeHtml(sl.name)+'</a>').join(', '):'—')+
      infoRow('Создана',formatDate(song.createdAt)+' '+formatTime(song.createdAt))+
      infoRow('Изменена',formatDate(song.updatedAt)+' '+formatTime(song.updatedAt))+
      (song.link?'<div class="info-row"><span class="info-label">Ссылка на оригинал / демо</span><span class="info-value"><a href="'+escapeHtml(song.link)+'" target="_blank" rel="noopener noreferrer" style="color:var(--accent);display:inline-flex;align-items:center;gap:6px">'+icon('link',14)+'Открыть</a></span></div>':'')+
      (song.notes?infoRow('Заметки',escapeHtml(song.notes)):'')+'</section>'+
    '<section class="card mb-4">'+fileListHTML(song.fileIds,'song',song.id)+'</section>'+
    '<section class="card mb-4"><div class="flex items-center justify-between flex-wrap gap-2 mb-2">'+
      '<h2 class="section-title" style="margin:0">Версии песни ('+versions.length+')</h2>'+
      '<button class="btn btn-sm" type="button" data-act="save-version" data-id="'+song.id+'">'+icon('copy',16)+'Зафиксировать версию</button></div>'+
      (versions.length?versions.slice(0,12).map((v,i)=>'<div class="version-item"><div class="version-info">'+
        '<div class="version-title">Версия '+(v.versionNumber||(versions.length-i))+(i===0?' <span class="badge badge-muted">предыдущая</span>':'')+'</div>'+
        '<div class="version-meta">'+escapeHtml(formatDate(v.createdAt)+' '+formatTime(v.createdAt))+' · '+escapeHtml(v.data.key||'—')+(v.data.bpm?' · '+v.data.bpm+' BPM':'')+'</div></div>'+
        '<button class="btn btn-sm" type="button" data-act="restore-version" data-id="'+v.id+'">'+icon('refresh',16)+'</button>'+
        '<button class="btn btn-sm btn-danger" type="button" data-act="delete-version" data-id="'+v.id+'" aria-label="Удалить">'+icon('trash',16)+'</button></div>').join('')
        :'<p class="text-muted" style="font-size:14px">История появится после первого редактирования.</p>')+'</section>'+
    '<div class="flex gap-2 flex-wrap"><button class="btn btn-danger" type="button" data-act="delete-song" data-id="'+song.id+'">'+icon('trash',16)+'Удалить песню</button></div>';}
function adjustTranspose(d){State.ui.transpose=clamp((State.ui.transpose||0)+d,-11,11);renderSongDetail(State.ui.parts[1]);}
function resetTranspose(){State.ui.transpose=0;renderSongDetail(State.ui.parts[1]);}
async function toggleFavorite(id){const s=findSong(id);if(!s)return;s.favorite=!s.favorite;await saveSong(s);
  if(State.ui.parts[1])renderSongDetail(id);else renderSongList();}
async function duplicateSong(id){const s=findSong(id);if(!s)return;
  const c=JSON.parse(JSON.stringify(s));c.id=uid('song');c.title=s.title+' (копия)';c.favorite=false;c.version=1;c.fileIds=[];c.createdAt=nowISO();c.updatedAt=nowISO();
  await saveSong(c);await logActivity('song','Создана копия песни «'+s.title+'»',c.id);navigate('#/songs/'+c.id);}
function confirmDeleteSong(id){const s=findSong(id);if(!s)return;
  Modal.confirm('Удалить песню?','«'+s.title+'» будет удалена из каталога, из всех сет-листов и групп вместе с вложениями.',async()=>{
    const copy=JSON.parse(JSON.stringify(s));
    const affected=State.setlists.filter(sl=>(sl.items||[]).some(i=>i.songId===id)).map(sl=>JSON.parse(JSON.stringify(sl)));
    await deleteSong(id);await logActivity('song','Удалена песня «'+s.title+'»',id);
    Toast.show('Песня удалена','success',{label:'Вернуть',fn:async()=>{await saveSong(copy);for(const sl of affected)await saveSetlist(sl);navigate('#/songs/'+copy.id);}});
    navigate('#/songs');},'Удалить',true);}
async function snapshotVersion(song){const v={id:uid('ver'),songId:song.id,versionNumber:song.version||1,data:JSON.parse(JSON.stringify(song)),createdAt:nowISO()};
  await dbPut('songVersions',v);State.songVersions.push(v);
  if(State.songVersions.length>400){const old=State.songVersions.shift();dbDelete('songVersions',old.id);}}
function restoreVersion(vid){const v=State.songVersions.find(x=>x.id===vid);if(!v){Toast.error('Версия не найдена');return;}
  const song=findSong(v.songId);if(!song){Toast.error('Песня не найдена');return;}
  Modal.confirm('Восстановить версию?','Содержимое «'+song.title+'» будет заменено версией от '+formatDate(v.createdAt)+'. Текущая редакция сохранится в истории.',async()=>{
    await snapshotVersion(song);const data=JSON.parse(JSON.stringify(v.data));
    data.id=song.id;data.version=(song.version||1)+1;data.createdAt=song.createdAt;
    await saveSong(data);await logActivity('song','Восстановлена версия «'+song.title+'»',song.id);
    renderSongDetail(song.id);},'Восстановить');}
async function deleteVersion(vid){const v=State.songVersions.find(x=>x.id===vid);if(!v)return;
  await dbDelete('songVersions',vid);State.songVersions=State.songVersions.filter(x=>x.id!==vid);
  Toast.show('Версия удалена','success',{label:'Вернуть',fn:async()=>{State.songVersions.push(v);await dbPut('songVersions',v);if(State.ui.parts[1])renderSongDetail(v.songId);}});
  if(State.ui.parts[1])renderSongDetail(State.ui.parts[1]);}
/* — Song editor + dynamics builder — */
function openSongEditor(prefill){
  prefill=prefill||{};
  const s=prefill.id?findSong(prefill.id):null,isEdit=!!s,draft=!isEdit?readDraft(DRAFT_SONG):null;
  let dynSecs=parseSections(s?s.lyrics:'');
  let dynRowsLocal=(s&&s.dynamics&&Array.isArray(s.dynamics.rows))?JSON.parse(JSON.stringify(s.dynamics.rows)):[];
  const body=(draft?'<div class="draft-banner"><span>📝</span><span>Найден черновик от '+escapeHtml(formatDateShort(draft.savedAt)+' '+formatTime(draft.savedAt))+'</span>'+
      '<button class="btn btn-sm" type="button" id="sgDraftRestore">Восстановить</button><button class="btn btn-sm" type="button" id="sgDraftDrop">Удалить</button></div>':'')+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="songTitle">Название *</label><input class="form-input" id="songTitle" type="text" maxlength="140" placeholder="Название песни" value="'+(s?escapeHtml(s.title):'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="songArtist">Исполнитель</label><input class="form-input" id="songArtist" type="text" placeholder="Исполнитель" value="'+(s?escapeHtml(s.artist||''):'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="songAuthor">Автор</label><input class="form-input" id="songAuthor" type="text" placeholder="Автор текста / музыки" value="'+(s?escapeHtml(s.author||''):'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="songKey">Тональность</label><input class="form-input" id="songKey" type="text" list="keyList" placeholder="C, G, Am, Bb" value="'+(s?escapeHtml(s.key||''):'')+'">'+
      '<datalist id="keyList">'+['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B','Am','Em','Dm','Cm','Gm','F#m'].map(k=>'<option value="'+k+'"></option>').join('')+'</datalist></div></div>'+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="songBpm">Темп (BPM)</label><input class="form-input" id="songBpm" type="number" min="20" max="400" inputmode="numeric" placeholder="72" value="'+(s&&s.bpm?s.bpm:'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="songTimeSig">Размер</label><select class="form-select" id="songTimeSig"><option value="">—</option>'+
      TIME_SIGNATURES.map(t=>'<option value="'+t+'"'+(s&&s.timeSignature===t?' selected':'')+'>'+t+'</option>').join('')+'</select></div>'+
    '<div class="form-group"><label class="form-label" for="songDuration">Длительность (сек)</label><input class="form-input" id="songDuration" type="number" min="0" max="3600" inputmode="numeric" placeholder="240" value="'+(s&&s.duration?s.duration:'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="songGenre">Жанр</label><input class="form-input" id="songGenre" type="text" list="genreList" placeholder="Worship" value="'+(s?escapeHtml(s.genre||''):'')+'">'+
      '<datalist id="genreList">'+GENRES.map(g=>'<option value="'+g+'"></option>').join('')+'</datalist></div>'+
    '<div class="form-group"><label class="form-label" for="songLang">Язык</label><input class="form-input" id="songLang" type="text" list="langList" placeholder="Русский" value="'+(s?escapeHtml(s.language||''):'')+'">'+
      '<datalist id="langList">'+['Русский','English','Українська','Español','Deutsch','Français'].map(l=>'<option value="'+l+'"></option>').join('')+'</datalist></div></div>'+
    '<div class="form-group"><label class="form-label" for="songTags">Теги (через запятую)</label><input class="form-input" id="songTags" type="text" placeholder="worship, modern" value="'+(s?escapeHtml((s.tags||[]).join(', ')):'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="songLink">Ссылка на оригинал, демо, аудио или видео</label><input class="form-input" id="songLink" type="url" inputmode="url" placeholder="https://…" value="'+(s?escapeHtml(s.link||''):'')+'"></div>'+
    '<div class="form-group"><span class="form-label">Группы, исполняющие песню</span><div class="chip-row" id="songGroups">'+
      (State.groups.length?State.groups.map(g=>{const on=s&&(s.groupIds||[]).indexOf(g.id)>=0;
        return '<label class="chip'+(on?' active':'')+'" style="border-left:3px solid '+escapeHtml(g.color||'var(--accent)')+'"><input type="checkbox" value="'+g.id+'"'+(on?' checked':'')+'>'+escapeHtml(g.name)+'</label>';}).join('')
        :'<p class="form-hint">Группы ещё не созданы.</p>')+'</div></div>'+
    '<div class="form-group"><label class="form-label" for="songLyrics">Текст песни и аккорды</label>'+
      '<textarea class="form-textarea" id="songLyrics" style="min-height:280px" spellcheck="false" placeholder="'+escapeHtml(SONG_TPL)+'">'+(s?escapeHtml(s.lyrics||''):'')+'</textarea>'+
      '<span class="form-hint">Аккорды — отдельной строкой над текстом. Поддержка: C, Cm, C7, Cmaj7, Cmaj9, Cadd9, Csus2, Csus4, C/E, F#m7, Bb, G#dim. Секции — [Verse 1], [Chorus], [Bridge].</span></div>'+
    '<div class="form-group"><div class="dyn-head"><span class="form-label">Динамика по инструментам</span>'+
      '<div class="dyn-actions"><button class="btn btn-sm" type="button" id="dynAddRow">'+icon('plus',15)+'Инструмент</button>'+
      '<button class="btn btn-sm" type="button" id="dynRefresh">'+icon('refresh',15)+'Обновить секции</button>'+
      '<button class="btn btn-sm btn-danger" type="button" id="dynClear">'+icon('trash',15)+'Очистить</button></div></div>'+
      '<div class="dyn-legend">'+DYN_LEVELS.map(l=>'<span>'+l.l+' — '+l.t+'</span>').join('')+'</div>'+
      '<p class="form-hint">Секции берутся из текста ([Verse 1], [Chorus]…). Нажимайте кнопку уровня, чтобы менять динамику: — не играет → p → mp → mf → f → ff. Для инструмента можно назначить музыканта и заполнить всю строку одним уровнем.</p>'+
      '<div id="dynEditor" class="mt-2"></div></div>'+
    '<div class="form-group"><label class="form-label" for="songNotes">Заметки для музыкантов</label>'+
      '<textarea class="form-textarea" id="songNotes" style="min-height:70px;font-family:var(--font);font-size:14px" placeholder="Вступление, соло, особенности аранжировки">'+(s?escapeHtml(s.notes||''):'')+'</textarea></div>'+
    (isEdit?fileListHTML(s.fileIds,'song',s.id):'<p class="form-hint">Файлы (PDF, изображения, аудио) можно прикрепить после сохранения песни.</p>')+
    '<div class="form-error" id="songError" role="alert" hidden></div>';
  Modal.show(isEdit?'Редактировать песню':'Новая песня',body,
    (isEdit?'<button class="btn btn-danger" type="button" data-act="delete-song" data-id="'+s.id+'" data-modal-close>'+icon('trash',16)+'</button>':'')+
    '<span class="autosave-note" id="songAutosave">Черновик сохраняется автоматически</span>'+
    '<button class="btn" type="button" data-modal-close>Отмена</button><button class="btn btn-primary" type="button" id="saveSongBtn">'+(isEdit?'Сохранить':'Создать песню')+'</button>',
    {size:'modal-lg',onMount:mount});
  function instrumentOptions(sel){const list=Array.from(new Set(DYN_INSTRUMENTS.concat(allRoles())));
    if(sel&&list.indexOf(sel)<0)list.unshift(sel);
    return list.map(i=>'<option value="'+escapeHtml(i)+'"'+(sel===i?' selected':'')+'>'+escapeHtml(i)+'</option>').join('');}
  function renderDyn(){
    const el=$('#dynEditor');if(!el)return;
    if(!dynRowsLocal.length){
      el.innerHTML='<div class="preview-box" style="max-height:none;text-align:center;padding:18px"><div style="font-weight:700;margin-bottom:6px">Динамика не расписана</div>'+
        '<p class="form-hint">Нажмите «Инструмент», добавьте строку, выберите музыканта и уровни громкости для каждой секции.</p>'+
        '<button class="btn btn-sm btn-primary mt-2" type="button" id="dynAddEmpty">'+icon('plus',15)+'Добавить инструмент</button></div>';
      const b=$('#dynAddEmpty');if(b)b.addEventListener('click',addDynRow);return;}
    el.innerHTML='<div class="form-hint mb-2">Секции: '+escapeHtml(dynSecs.join(' · '))+'</div>'+dynRowsLocal.map((r,ri)=>
      '<div class="dyn-row" data-row="'+ri+'"><div class="dyn-row-head">'+
        '<select class="form-select dyn-instr" aria-label="Инструмент">'+instrumentOptions(r.instrument)+'</select>'+
        '<select class="form-select dyn-member" aria-label="Музыкант"><option value="">Музыкант не назначен</option>'+
          State.members.map(m=>'<option value="'+m.id+'"'+(r.memberId===m.id?' selected':'')+'>'+escapeHtml(m.name+(m.roles&&m.roles.length?' · '+m.roles.join(', '):''))+'</option>').join('')+'</select>'+
        '<select class="form-select dyn-fill" aria-label="Заполнить строку"><option value="">Заполнить всё…</option>'+
          DYN_LEVELS.map(l=>'<option value="'+l.v+'">'+l.l+' — '+l.t+'</option>').join('')+'</select>'+
        '<button class="btn btn-sm btn-danger dyn-del" type="button" aria-label="Удалить строку">'+icon('trash',15)+'</button></div>'+
        '<div class="dyn-cells">'+dynSecs.map(sec=>{const lv=(r.levels&&r.levels[sec])||'off';
          return '<button class="dyn-cell lv-'+lv+'" type="button" data-sec="'+escapeHtml(sec)+'" aria-label="'+escapeHtml(sec+': '+dynLevel(lv).t)+'">'+
            escapeHtml(sec.length>14?sec.slice(0,13)+'…':sec)+'<b>'+dynLevel(lv).l+'</b></button>';}).join('')+'</div></div>').join('');
    $$('#dynEditor .dyn-row').forEach(rowEl=>{
      const ri=parseInt(rowEl.getAttribute('data-row'),10),row=dynRowsLocal[ri];
      $('.dyn-instr',rowEl).addEventListener('change',ev=>{row.instrument=ev.target.value;},{passive:true});
      $('.dyn-member',rowEl).addEventListener('change',ev=>{row.memberId=ev.target.value||null;},{passive:true});
      $('.dyn-fill',rowEl).addEventListener('change',ev=>{const v=ev.target.value;if(!v)return;
        row.levels=row.levels||{};dynSecs.forEach(sec=>{row.levels[sec]=v;});ev.target.value='';renderDyn();},{passive:true});
      $('.dyn-del',rowEl).addEventListener('click',()=>{dynRowsLocal.splice(ri,1);renderDyn();});
      $$('.dyn-cell',rowEl).forEach(cell=>cell.addEventListener('click',()=>{
        const sec=cell.getAttribute('data-sec');row.levels=row.levels||{};
        const cur=row.levels[sec]||'off',idx=DYN_LEVELS.findIndex(l=>l.v===cur),nxt=DYN_LEVELS[(idx+1)%DYN_LEVELS.length];
        row.levels[sec]=nxt.v;cell.className='dyn-cell lv-'+nxt.v;
        cell.querySelector('b').textContent=nxt.l;
        cell.setAttribute('aria-label',sec+': '+nxt.t);}));});}
  function addDynRow(){
    const used=dynRowsLocal.map(r=>r.instrument);
    const next=DYN_INSTRUMENTS.find(i=>used.indexOf(i)<0)||'Other';
    const row={id:uid('dyn'),instrument:next,memberId:null,levels:{}};
    dynSecs.forEach(sec=>{row.levels[sec]='mf';});
    dynRowsLocal.push(row);renderDyn();}
  function mount(){
    $$('#songGroups input').forEach(cb=>cb.addEventListener('change',()=>cb.closest('.chip').classList.toggle('active',cb.checked),{passive:true}));
    renderDyn();
    $('#dynAddRow').addEventListener('click',addDynRow);
    $('#dynRefresh').addEventListener('click',()=>{
      const secs=parseSections($('#songLyrics').value);
      dynSecs=secs;
      dynRowsLocal.forEach(r=>{const lvl=r.levels||{},keep={},keys=Object.keys(lvl);
        secs.forEach(sec=>{keep[sec]=lvl[sec]||(keys.length?lvl[keys[0]]:'mf');});r.levels=keep;});
      renderDyn();});
    $('#dynClear').addEventListener('click',()=>{
      if(!dynRowsLocal.length)return;
      const copy=JSON.parse(JSON.stringify(dynRowsLocal));dynRowsLocal=[];renderDyn();
      Toast.show('Динамика очищена','success',{label:'Вернуть',fn:()=>{dynRowsLocal=copy;renderDyn();}});});
    const lyr=$('#songLyrics');
    const saveDraftFn=debounce(()=>{if(isEdit)return;const t=$('#songTitle').value.trim();
      if(!t&&!lyr.value.trim()){writeDraft(DRAFT_SONG,null);return;}
      writeDraft(DRAFT_SONG,{title:t,artist:$('#songArtist').value,author:$('#songAuthor').value,key:$('#songKey').value,bpm:$('#songBpm').value,
        timeSignature:$('#songTimeSig').value,duration:$('#songDuration').value,genre:$('#songGenre').value,language:$('#songLang').value,
        tags:$('#songTags').value,link:$('#songLink').value,lyrics:lyr.value,notes:$('#songNotes').value,savedAt:nowISO()});
      const n=$('#songAutosave');if(n)n.textContent='Черновик сохранён в '+formatTime(new Date());},800);
    ['songTitle','songArtist','songAuthor','songKey','songBpm','songDuration','songGenre','songLang','songTags','songLink','songNotes','songLyrics'].forEach(idf=>{
      const x=$('#'+idf);if(x)x.addEventListener('input',saveDraftFn,{passive:true});});
    const ts=$('#songTimeSig');if(ts)ts.addEventListener('change',saveDraftFn,{passive:true});
    const ctrlS=ev=>{if((ev.ctrlKey||ev.metaKey)&&['s','S','ы','Ы'].indexOf(ev.key)>=0){
      if(!Modal.isOpen()){document.removeEventListener('keydown',ctrlS);return;}
      ev.preventDefault();const b=$('#saveSongBtn');if(b)b.click();}};
    document.addEventListener('keydown',ctrlS);
    const dr=$('#sgDraftRestore');
    if(dr)dr.addEventListener('click',()=>{const d=readDraft(DRAFT_SONG);if(!d)return;
      const map={title:'#songTitle',artist:'#songArtist',author:'#songAuthor',key:'#songKey',bpm:'#songBpm',timeSignature:'#songTimeSig',duration:'#songDuration',genre:'#songGenre',language:'#songLang',tags:'#songTags',link:'#songLink',lyrics:'#songLyrics',notes:'#songNotes'};
      Object.keys(map).forEach(k=>{const elx=$(map[k]);if(elx)elx.value=d[k]||'';});
      dynSecs=parseSections(d.lyrics||'');renderDyn();});
    const ddr=$('#sgDraftDrop');
    if(ddr)ddr.addEventListener('click',()=>{writeDraft(DRAFT_SONG,null);const b=$('.draft-banner');if(b)b.remove();});
    $('#saveSongBtn').addEventListener('click',saveHandler);}
  async function saveHandler(ev){
    const btn=ev.currentTarget;btn.classList.add('loading');
    const fail=(m,f)=>{btn.classList.remove('loading');const er=$('#songError');er.textContent=m;er.hidden=false;
      $$('.form-input.error,.form-textarea.error,.form-select.error').forEach(x=>x.classList.remove('error'));
      const x=$('#'+f);if(x){x.classList.add('error');x.focus();}};
    const title=$('#songTitle').value.trim();if(!title)return fail('Введите название песни','songTitle');
    const keyVal=$('#songKey').value.trim();
    if(keyVal&&!/^[A-G][#b]?/.test(keyVal))return fail('Тональность должна начинаться с ноты A–G (C, Am, Bb, F#)','songKey');
    const bpmRaw=$('#songBpm').value.trim(),bpm=bpmRaw?parseInt(bpmRaw,10):null;
    if(bpm!==null&&(isNaN(bpm)||bpm<20||bpm>400))return fail('BPM должен быть в диапазоне 20–400','songBpm');
    const durRaw=$('#songDuration').value.trim(),dur=durRaw?parseInt(durRaw,10):null;
    if(dur!==null&&(isNaN(dur)||dur<0||dur>3600))return fail('Длительность: 0–3600 секунд','songDuration');
    const link=$('#songLink').value.trim();
    if(link&&!/^(https?:\/\/|www\.)/i.test(link))return fail('Ссылка должна начинаться с http:// или https://','songLink');
    const cleanRows=dynRowsLocal.filter(r=>r&&r.instrument).map(r=>{const levels={};
      dynSecs.forEach(sec=>{levels[sec]=(r.levels&&r.levels[sec])||'off';});
      return{id:r.id||uid('dyn'),instrument:r.instrument,memberId:r.memberId||null,levels};});
    if(isEdit)await snapshotVersion(s);
    const song=s?Object.assign({},s):{id:uid('song'),createdAt:nowISO(),favorite:false,version:1,fileIds:[]};
    song.title=title;song.artist=$('#songArtist').value.trim();song.author=$('#songAuthor').value.trim();
    song.key=keyVal||null;song.bpm=bpm;song.duration=dur;song.timeSignature=$('#songTimeSig').value||'';
    song.genre=$('#songGenre').value.trim();song.language=$('#songLang').value.trim();
    song.tags=$('#songTags').value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,24);
    song.link=link;song.groupIds=$$('#songGroups input:checked').map(c=>c.value);
    song.lyrics=$('#songLyrics').value;song.notes=$('#songNotes').value.trim();
    song.dynamics=cleanRows.length?{sections:dynSecs.slice(),rows:cleanRows}:null;
    song.version=(song.version||1)+(isEdit?1:0);
    await saveSong(song);await logActivity('song',(isEdit?'Обновлена песня «':'Добавлена песня «')+song.title+'»',song.id);
    if(!isEdit)writeDraft(DRAFT_SONG,null);
    Modal.close();State.ui.transpose=0;navigate('#/songs/'+song.id);}}
function songToText(song,tr){const t=tr||0,lines=[song.title,'='.repeat(Math.max(10,song.title.length))],meta=[];
  if(song.artist||song.author)meta.push((song.artist?'Исполнитель: '+song.artist:'')+(song.author?' · Автор: '+song.author:''));
  if(song.key)meta.push('Тональность: '+transposeKey(song.key,t));
  if(song.bpm)meta.push('BPM: '+song.bpm);
  if(song.timeSignature)meta.push('Размер: '+song.timeSignature);
  if(song.genre)meta.push('Жанр: '+song.genre);
  if(song.duration)meta.push('Время: '+durationLabel(song.duration));
  if(song.tags&&song.tags.length)meta.push('Теги: '+song.tags.join(', '));
  if(meta.length)lines.push(meta.join(' | '));
  lines.push('',transposeLyricsText(song.lyrics,t));
  if(dynRows(song).length)lines.push(dynamicsText(song));
  if(song.notes)lines.push('','Заметки:',song.notes);
  if(song.link)lines.push('Ссылка: '+song.link);
  return lines.join('\n');}
function songToSetlist(songId){const s=findSong(songId);if(!s)return;
  if(!State.setlists.length){Modal.confirm('Нет сет-листов','Чтобы добавить песню, сначала создайте сет-лист. Создать сейчас?',()=>openSetlistEditor({songId}),'Создать сет-лист');return;}
  Modal.show('Добавить «'+s.title+'» в сет-лист',
    '<div class="filter-search-inline mb-2">'+icon('search',16)+'<input type="search" id="slPickSearch" placeholder="Поиск сет-листа…" aria-label="Поиск"></div><div id="slPickList" style="max-height:48vh;overflow-y:auto"></div>',
    '',{onMount(){const render=q=>{
        const items=State.setlists.filter(sl=>!q||sl.name.toLowerCase().indexOf(q.toLowerCase())>=0);
        $('#slPickList').innerHTML=items.length?items.map(sl=>{const has=(sl.items||[]).some(i=>i.songId===s.id);
          return '<div class="search-result-item" role="button" tabindex="0" data-pick="'+sl.id+'"><span class="search-result-icon">📋</span><div style="min-width:0">'+
            '<div class="search-result-title">'+escapeHtml(sl.name)+'</div><div class="search-result-meta">'+
            (sl.items||[]).length+' '+plural((sl.items||[]).length,'песня','песни','песен')+' · '+SETLIST_STATUS[sl.status||'active']+(has?' · уже добавлена':'')+'</div></div></div>';}).join('')
          :'<p class="text-muted text-center" style="padding:20px">Ничего не найдено</p>';
        $$('[data-pick]').forEach(it=>{const go=async()=>{const sl=findSetlist(it.getAttribute('data-pick'));if(!sl)return;
            if((sl.items||[]).some(i=>i.songId===s.id)){Modal.close();return;}
            sl.items=sl.items||[];sl.items.push({id:uid('si'),songId:s.id,position:sl.items.length,keyOverride:null,bpmOverride:null,notes:'',transition:'',leadMemberId:null});
            await saveSetlist(sl);await logActivity('setlist','«'+s.title+'» добавлена в «'+sl.name+'»',sl.id);
            Modal.close();navigate('#/band/setlist/'+sl.id);};
          it.addEventListener('click',go);it.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();go();}});});};
      render('');$('#slPickSearch').addEventListener('input',debounce(ev=>render(ev.target.value),160),{passive:true});}});}

/* ═══ SECTION 10: BAND ═══ */
function renderBand(){
  const tab=State.ui.bandTab||'setlists';
  $('#content').innerHTML='<div class="page-header"><div><h1 class="page-title">Сет-листы и группы</h1>'+
      '<p class="page-subtitle">'+State.setlists.length+' '+plural(State.setlists.length,'сет-лист','сет-листа','сет-листов')+' · '+
      State.groups.length+' '+plural(State.groups.length,'группа','группы','групп')+' · '+
      State.members.length+' '+plural(State.members.length,'участник','участника','участников')+'</p></div>'+
    '<div class="page-actions"><button class="btn btn-primary" type="button" data-act="new-setlist" id="bandCreateBtn">'+icon('plus',18)+'<span id="bandCreateLabel">Сет-лист</span></button></div></div>'+
    '<div class="tabs" id="bandTabs" role="tablist">'+
      [['setlists','Сет-листы'],['groups','Группы'],['members','Участники']].map(t=>
        '<button class="tab'+(tab===t[0]?' active':'')+'" role="tab" aria-selected="'+(tab===t[0])+'" type="button" data-act="band-tab" data-val="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>'+
    '<div id="bandContent"></div>';
  renderBandContent();}
function renderBandContent(){
  const tab=State.ui.bandTab||'setlists';
  const lbl=$('#bandCreateLabel');if(lbl)lbl.textContent=tab==='groups'?'Группа':tab==='members'?'Участник':'Сет-лист';
  const btn=$('#bandCreateBtn');if(btn)btn.setAttribute('data-act',tab==='groups'?'new-group':tab==='members'?'new-member':'new-setlist');
  const el=$('#bandContent');if(!el)return;
  if(tab==='groups')renderGroupsTab(el);else if(tab==='members')renderMembersTab(el);else renderSetlistsTab(el);}
function bandSearchHTML(ph){return '<div class="filter-search-inline mb-4" style="max-width:460px">'+icon('search',16)+
  '<input type="search" id="bandSearch" placeholder="'+escapeHtml(ph)+'" value="'+escapeHtml(State.ui.bandQuery)+'" aria-label="'+escapeHtml(ph)+'"></div>';}
function renderSetlistsTab(el){
  const q=(State.ui.bandQuery||'').toLowerCase();
  const list=State.setlists.filter(s=>!q||s.name.toLowerCase().indexOf(q)>=0).sort((a,b)=>new Date(b.updatedAt||0)-new Date(a.updatedAt||0));
  el.innerHTML=bandSearchHTML('Поиск сет-листов…')+'<div id="setlistList" class="grid grid-2"></div>';
  $('#bandSearch').addEventListener('input',debounce(ev=>{State.ui.bandQuery=ev.target.value;renderSetlistsTab(el);},170),{passive:true});
  const cont=$('#setlistList');
  if(!list.length){cont.innerHTML='<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📋</div><div class="empty-state-title">Нет сет-листов</div>'+
    '<div class="empty-state-text">Сет-лист — программа репетиции, концерта или служения: песни в нужном порядке, тональности, ответственные и переходы.</div>'+
    '<button class="btn btn-primary" data-act="new-setlist">'+icon('plus',18)+'Создать сет-лист</button></div>';return;}
  renderChunked(cont,list,sl=>{const st=setlistStats(sl),g=findGroup(sl.groupId),ev=State.events.find(e=>e.setlistId===sl.id);
    return '<article class="song-card" data-sl="'+sl.id+'" role="link" tabindex="0"><div class="song-card-title">'+escapeHtml(sl.name)+'</div>'+
      '<div class="song-card-meta"><span>'+icon('music',13)+' '+st.count+'</span>'+(st.duration?'<span>'+icon('clock',13)+' '+durationLabel(st.duration)+'</span>':'')+
      (st.avgBpm?'<span>🥁 '+st.avgBpm+' BPM</span>':'')+(g?'<span>'+icon('users',13)+' '+escapeHtml(g.name)+'</span>':'')+
      (ev?'<span>'+icon('calendar',13)+' '+escapeHtml(formatDateShort(ev.start))+'</span>':'')+'</div>'+
      '<div style="margin-top:10px"><span class="badge '+(sl.status==='draft'?'badge-muted':sl.status==='done'?'badge-success':sl.status==='archived'?'badge-warning':'badge-accent')+'">'+SETLIST_STATUS[sl.status||'active']+'</span></div>'+
      (sl.notes?'<div style="font-size:13px;color:var(--text-muted);margin-top:8px">'+escapeHtml(sl.notes)+'</div>':'')+'</article>';},20);}
function renderGroupsTab(el){
  const q=(State.ui.bandQuery||'').toLowerCase(),showArch=State.ui.filters.showArchived;
  const list=State.groups.filter(g=>(showArch||g.status!=='archived')&&(!q||g.name.toLowerCase().indexOf(q)>=0||(g.description||'').toLowerCase().indexOf(q)>=0));
  el.innerHTML='<div class="flex gap-2 flex-wrap mb-4" style="align-items:center">'+
      '<div class="filter-search-inline" style="flex:1;min-width:180px;max-width:420px">'+icon('search',16)+'<input type="search" id="bandSearch" placeholder="Поиск групп…" value="'+escapeHtml(State.ui.bandQuery)+'" aria-label="Поиск групп"></div>'+
      '<label class="chip'+(showArch?' active':'')+'"><input type="checkbox" id="showArchived"'+(showArch?' checked':'')+'>Показывать архив</label></div>'+
    '<div id="groupList" class="grid grid-2"></div>';
  $('#bandSearch').addEventListener('input',debounce(ev=>{State.ui.bandQuery=ev.target.value;renderGroupsTab(el);},170),{passive:true});
  $('#showArchived').addEventListener('change',ev=>{State.ui.filters.showArchived=ev.target.checked;ev.target.closest('.chip').classList.toggle('active',ev.target.checked);renderGroupsTab(el);},{passive:true});
  const cont=$('#groupList');
  if(!list.length){cont.innerHTML='<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">👥</div><div class="empty-state-title">Нет групп</div>'+
    '<div class="empty-state-text">Группа объединяет участников с ролями, песни, репетиции, выступления и сет-листы одного коллектива.</div>'+
    '<button class="btn btn-primary" data-act="new-group">'+icon('plus',18)+'Создать группу</button></div>';return;}
  cont.innerHTML=list.map(g=>{const mem=State.members.filter(m=>(m.groupIds||[]).indexOf(g.id)>=0);
    const evts=State.events.filter(e=>e.groupId===g.id&&new Date(e.start)>=new Date());
    const sls=State.setlists.filter(s=>s.groupId===g.id),songs=State.songs.filter(s=>(s.groupIds||[]).indexOf(g.id)>=0);
    return '<article class="card group-card" data-group="'+g.id+'" role="link" tabindex="0">'+
      '<div class="group-card-color" style="background:'+escapeHtml(g.color||'var(--accent)')+'"></div>'+
      '<div class="song-card-title" style="padding-right:0">'+escapeHtml(g.name)+(g.status==='archived'?' <span class="badge badge-warning">Архив</span>':'')+'</div>'+
      '<div class="song-card-meta"><span>'+icon('users',13)+' '+mem.length+'</span><span>'+icon('music',13)+' '+songs.length+'</span>'+
      '<span>'+icon('calendar',13)+' '+evts.length+'</span><span>'+icon('list',13)+' '+sls.length+'</span></div>'+
      (g.description?'<div style="font-size:13px;color:var(--text-muted);margin-top:8px">'+escapeHtml(g.description)+'</div>':'')+
      (mem.length?'<div class="event-participants"><span class="avatar-stack">'+mem.slice(0,7).map(m=>
        '<span class="mini-avatar" style="background:'+escapeHtml(m.color||'var(--accent)')+'" title="'+escapeHtml(m.name)+'">'+escapeHtml((m.name||'?')[0].toUpperCase())+'</span>').join('')+
        (mem.length>7?'<span class="mini-avatar mini-more">+'+(mem.length-7)+'</span>':'')+'</span></div>':'')+'</article>';}).join('');}
function renderMembersTab(el){
  const q=(State.ui.bandQuery||'').toLowerCase();
  const list=State.members.filter(m=>!q||m.name.toLowerCase().indexOf(q)>=0||(m.roles||[]).some(r=>r.toLowerCase().indexOf(q)>=0));
  el.innerHTML=bandSearchHTML('Поиск участников и ролей…')+'<div id="memberList" class="grid grid-2"></div>';
  $('#bandSearch').addEventListener('input',debounce(ev=>{State.ui.bandQuery=ev.target.value;renderMembersTab(el);},170),{passive:true});
  const cont=$('#memberList');
  if(!list.length){cont.innerHTML='<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🎤</div><div class="empty-state-title">Нет участников</div>'+
    '<div class="empty-state-text">Добавьте музыкантов, укажите роли и контакты — и отмечайте состав на каждое событие.</div>'+
    '<button class="btn btn-primary" data-act="new-member">'+icon('plus',18)+'Добавить участника</button></div>';return;}
  cont.innerHTML=list.map(m=>{const evts=State.events.filter(e=>(e.participants||[]).some(p=>p.memberId===m.id)&&new Date(e.start)>=new Date());
    const c=m.contacts||{};
    return '<article class="member-card" data-member="'+m.id+'" role="button" tabindex="0">'+
      '<div class="member-avatar" style="background:'+escapeHtml(m.color||'var(--accent)')+'">'+escapeHtml((m.name||'?')[0].toUpperCase())+'</div>'+
      '<div class="member-info"><div class="member-name">'+escapeHtml(m.name)+'</div>'+
      '<div class="member-roles">'+((m.roles||[]).map(r=>'<span class="role-tag" style="background:'+hexToRgba(ROLE_COLORS[r]||'#9ca3af',0.16)+';color:'+(ROLE_COLORS[r]||'#9ca3af')+'">'+escapeHtml(r)+'</span>').join('')||'<span class="text-muted">Роль не указана</span>')+'</div>'+
      '<div class="member-contacts">'+
        (c.phone?'<a class="contact-link" href="tel:'+escapeHtml(c.phone.replace(/[^+\d]/g,''))+'" onclick="event.stopPropagation()">📞 '+escapeHtml(c.phone)+'</a>':'')+
        (c.email?'<a class="contact-link" href="mailto:'+escapeHtml(c.email)+'" onclick="event.stopPropagation()">✉️ '+escapeHtml(c.email)+'</a>':'')+
        (c.telegram?'<a class="contact-link" href="https://t.me/'+escapeHtml(c.telegram.replace('@',''))+'" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">✈️ '+escapeHtml(c.telegram)+'</a>':'')+
        (c.whatsapp?'<a class="contact-link" href="https://wa.me/'+escapeHtml(c.whatsapp.replace(/[^+\d]/g,''))+'" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">💬 WhatsApp</a>':'')+
      '</div><div class="form-hint" style="margin-top:6px">'+evts.length+' '+plural(evts.length,'предстоящее событие','предстоящих события','предстоящих событий')+'</div></div>'+
      '<span class="badge '+(m.status==='active'?'badge-success':m.status==='invited'?'badge-accent':m.status==='paused'?'badge-warning':'badge-muted')+'">'+MEMBER_STATUS[m.status||'active']+'</span></article>';}).join('');}
function setlistStats(sl){const items=sl.items||[];let dur=0,bpmSum=0,n=0;
  items.forEach(it=>{const s=findSong(it.songId);if(!s)return;dur+=s.duration||0;const b=it.bpmOverride||s.bpm;if(b){bpmSum+=b;n++;}});
  return{count:items.length,duration:dur,avgBpm:n?Math.round(bpmSum/n):0};}
function renderSetlistDetail(id){
  const sl=findSetlist(id);if(!sl){Toast.error('Сет-лист не найден');navigate('#/band');return;}
  const st=setlistStats(sl),g=findGroup(sl.groupId);
  const linked=State.events.filter(e=>e.setlistId===sl.id).sort((a,b)=>new Date(a.start)-new Date(b.start));
  $('#content').innerHTML='<div class="page-header"><div>'+
      '<button class="btn btn-sm mb-2" data-go="#/band">'+icon('arrowLeft',16)+'К сет-листам</button>'+
      '<h1 class="page-title">'+escapeHtml(sl.name)+'</h1>'+
      '<p class="page-subtitle">'+st.count+' '+plural(st.count,'песня','песни','песен')+' · '+durationLabel(st.duration)+' · '+
        (st.avgBpm?st.avgBpm+' BPM':'темп не задан')+(g?' · '+escapeHtml(g.name):'')+' · '+SETLIST_STATUS[sl.status||'active']+'</p></div>'+
    '<div class="page-actions"><button class="btn btn-primary" type="button" data-act="launch-scene" data-id="'+sl.id+'">'+icon('stage',16)+'Сцена</button>'+
      '<button class="btn" type="button" data-act="edit-setlist" data-id="'+sl.id+'">'+icon('edit',16)+'</button>'+
      '<button class="btn" type="button" data-act="print-setlist-full" data-id="'+sl.id+'">'+icon('print',16)+'</button>'+
      '<button class="btn" type="button" data-act="export-setlist" data-id="'+sl.id+'">'+icon('download',16)+'</button>'+
      '<button class="btn" type="button" data-act="duplicate-setlist" data-id="'+sl.id+'">'+icon('copy',16)+'</button></div></div>'+
    '<div class="card mb-4"><h2 class="section-title">Статус сет-листа</h2><div class="chip-row">'+
      Object.keys(SETLIST_STATUS).map(k=>'<button class="chip'+((sl.status||'active')===k?' active':'')+'" type="button" data-act="sl-status" data-id="'+sl.id+'" data-val="'+k+'">'+SETLIST_STATUS[k]+'</button>').join('')+'</div></div>'+
    (linked.length?'<div class="card mb-4"><h2 class="section-title">Связанные события</h2>'+linked.map(e=>occurrenceCardHTML({ev:e,start:new Date(e.start),end:new Date(e.end||e.start),key:e.id,single:true},false)).join('')+'</div>':'')+
    '<section class="card mb-4"><div class="flex items-center justify-between flex-wrap gap-2">'+
      '<h2 class="section-title" style="margin:0">Программа</h2><div class="flex gap-2 flex-wrap">'+
      '<button class="btn btn-sm" type="button" data-act="print-setlist-short" data-id="'+sl.id+'">Печать (кратко)</button>'+
      '<button class="btn btn-sm btn-primary" type="button" data-act="add-song-to-setlist" data-id="'+sl.id+'">'+icon('plus',16)+'Песня</button></div></div>'+
      '<p class="form-hint mt-2">Перетаскивайте за ручку (работает на телефоне) или используйте стрелки. Для каждой песни — своя тональность, темп, ответственный и переход.</p>'+
      '<div id="setlistItems" style="margin-top:14px"></div><div class="setlist-stats mt-4" id="setlistStats"></div></section>'+
    (sl.notes?'<section class="card mb-4"><h2 class="section-title">Общие заметки</h2><p style="font-size:14px;color:var(--text-muted);white-space:pre-wrap">'+escapeHtml(sl.notes)+'</p></section>':'')+
    '<div class="flex gap-2 flex-wrap"><button class="btn btn-danger" type="button" data-act="delete-setlist" data-id="'+sl.id+'">'+icon('trash',16)+'Удалить сет-лист</button></div>';
  renderSetlistItems(sl);}
function renderSetlistItems(sl){
  const el=$('#setlistItems');if(!el)return;const items=sl.items||[];
  if(!items.length)el.innerHTML=emptyBlock('🎶','Программа пуста','Добавьте песни из каталога — они появятся здесь в нужном порядке.','add-song-to-setlist','Добавить песню',sl.id);
  else el.innerHTML=items.map((it,i)=>{const s=findSong(it.songId);
    if(!s)return '<div class="setlist-item"><div class="setlist-item-num">'+(i+1)+'</div><div class="setlist-item-info"><div class="setlist-item-title text-muted">Песня удалена из каталога</div></div>'+
      '<div class="setlist-item-actions"><button class="danger" type="button" data-act="sl-remove" data-sl="'+sl.id+'" data-item="'+it.id+'" aria-label="Удалить">'+icon('x',16)+'</button></div></div>';
    const lead=it.leadMemberId?findMember(it.leadMemberId):null,dyn=dynRows(s).length;
    const meta=[it.keyOverride||s.key||'—',(it.bpmOverride||s.bpm||'—')+' BPM',s.duration?durationLabel(s.duration):'',lead?'🎤 '+lead.name:'',dyn?'динамика: '+dyn:'',it.transition?'↦ '+it.transition:'',it.notes?'✎ '+it.notes:''].filter(Boolean).join(' · ');
    return '<div class="setlist-item" data-item="'+it.id+'" data-index="'+i+'">'+
      '<span class="setlist-item-handle" role="button" tabindex="0" aria-label="Перетащить '+escapeHtml(s.title)+'">'+icon('grip',18)+'</span>'+
      '<div class="setlist-item-num">'+(i+1)+'</div>'+
      '<div class="setlist-item-info" data-act="sl-song" data-id="'+s.id+'" role="link" tabindex="0">'+
        '<div class="setlist-item-title">'+escapeHtml(s.title)+((it.keyOverride||it.bpmOverride)?' <span class="badge badge-warning" style="font-size:10px">изменено</span>':'')+'</div>'+
        '<div class="setlist-item-meta">'+escapeHtml(meta)+'</div></div>'+
      '<div class="setlist-item-actions">'+
        '<button type="button" data-act="sl-up" data-sl="'+sl.id+'" data-item="'+it.id+'" aria-label="Вверх"'+(i===0?' disabled':'')+'>'+icon('up',16)+'</button>'+
        '<button type="button" data-act="sl-down" data-sl="'+sl.id+'" data-item="'+it.id+'" aria-label="Вниз"'+(i===items.length-1?' disabled':'')+'>'+icon('down',16)+'</button>'+
        '<button type="button" data-act="sl-edit-item" data-sl="'+sl.id+'" data-item="'+it.id+'" aria-label="Параметры">'+icon('edit',16)+'</button>'+
        '<button type="button" class="danger" data-act="sl-remove" data-sl="'+sl.id+'" data-item="'+it.id+'" aria-label="Убрать">'+icon('x',16)+'</button></div></div>';}).join('');
  const statsEl=$('#setlistStats');
  if(statsEl){const st=setlistStats(sl);
    statsEl.innerHTML='<span class="badge badge-accent">'+st.count+' '+plural(st.count,'песня','песни','песен')+'</span>'+
      '<span class="badge badge-muted">'+icon('clock',13)+' ориентировочно '+durationLabel(st.duration)+'</span>'+
      '<span class="badge badge-muted">🥁 средний темп '+(st.avgBpm||'—')+'</span>';}
  setupSetlistDnD(sl,el);}
function setupSetlistDnD(sl,listEl){
  $$('.setlist-item',listEl).forEach(item=>{const handle=$('.setlist-item-handle',item);if(!handle)return;
    makeDraggable(handle,{
      onStart(){State.ui.dragging=true;item.classList.add('dragging');},
      onMove(ev,dx,dy){item.style.transform='translateY('+dy+'px)';
        const after=getDragAfter(listEl,ev.clientY);if(after==null)listEl.appendChild(item);else listEl.insertBefore(item,after);},
      onEnd(){State.ui.dragging=false;item.classList.remove('dragging');item.style.transform='';persistSetlistOrder(sl,listEl);},
      onTap(){}});
    handle.addEventListener('keydown',ev=>{if(ev.key==='ArrowUp'||ev.key==='ArrowDown'){ev.preventDefault();moveSetlistItem(sl.id,item.getAttribute('data-item'),ev.key==='ArrowUp'?-1:1);}});});}
function getDragAfter(container,y){const els=$$('.setlist-item:not(.dragging)',container);
  let best={off:Number.NEGATIVE_INFINITY,el:null};
  els.forEach(c=>{const b=c.getBoundingClientRect(),o=y-b.top-b.height/2;if(o<0&&o>best.off)best={off:o,el:c};});
  return best.el;}
async function persistSetlistOrder(sl,listEl){
  const order=$$('.setlist-item',listEl).map(x=>x.getAttribute('data-item'));
  const map={};(sl.items||[]).forEach(i=>{map[i.id]=i;});
  const next=order.map(id=>map[id]).filter(Boolean);
  if(next.length!==(sl.items||[]).length||!next.some((it,i)=>(sl.items||[])[i]!==it))return;
  sl.items=next;await saveSetlist(sl);
  await logActivity('setlist','Изменён порядок песен в «'+sl.name+'»',sl.id);
  renderSetlistItems(sl);}
async function moveSetlistItem(slId,itemId,dir){const sl=findSetlist(slId);if(!sl)return;
  const items=sl.items||[],i=items.findIndex(x=>x.id===itemId),j=i+dir;
  if(i<0||j<0||j>=items.length)return;
  const tmp=items[i];items[i]=items[j];items[j]=tmp;sl.items=items;await saveSetlist(sl);renderSetlistItems(sl);}
function openSetlistEditor(prefill){
  prefill=prefill||{};const sl=prefill.id?findSetlist(prefill.id):null,isEdit=!!sl;
  const curEvent=sl?(State.events.find(x=>x.setlistId===sl.id)||{}).id:(prefill.eventId||null);
  const body='<div class="form-group"><label class="form-label" for="slName">Название *</label>'+
      '<input class="form-input" id="slName" type="text" maxlength="120" placeholder="Например: Воскресное служение, 12 января" value="'+(sl?escapeHtml(sl.name):'')+'"></div>'+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="slGroup">Группа</label><select class="form-select" id="slGroup"><option value="">—</option>'+
      State.groups.map(g=>'<option value="'+g.id+'"'+((sl&&sl.groupId===g.id)||(!sl&&prefill.groupId===g.id)?' selected':'')+'>'+escapeHtml(g.name)+'</option>').join('')+'</select></div>'+
    '<div class="form-group"><label class="form-label" for="slStatus">Статус</label><select class="form-select" id="slStatus">'+
      Object.keys(SETLIST_STATUS).map(k=>'<option value="'+k+'"'+((sl?(sl.status||'active'):'active')===k?' selected':'')+'>'+SETLIST_STATUS[k]+'</option>').join('')+'</select></div></div>'+
    '<div class="form-group"><label class="form-label" for="slEvent">Привязать к событию в календаре</label><select class="form-select" id="slEvent"><option value="">—</option>'+
      State.events.slice().sort((a,b)=>new Date(b.start)-new Date(a.start)).slice(0,50).map(e=>
        '<option value="'+e.id+'"'+(curEvent===e.id?' selected':'')+'>'+escapeHtml(e.title+' · '+formatDateShort(e.start))+'</option>').join('')+'</select></div>'+
    '<div class="form-group"><label class="form-label" for="slNotes">Общие заметки (переходы, вступления, финалы, техника)</label>'+
      '<textarea class="form-textarea" id="slNotes" style="min-height:84px;font-family:var(--font);font-size:14px" placeholder="Между песнями 3 и 4 — переход без паузы">'+(sl?escapeHtml(sl.notes||''):'')+'</textarea></div>'+
    '<div class="form-error" id="slError" role="alert" hidden></div>';
  Modal.show(isEdit?'Настройки сет-листа':'Новый сет-лист',body,
    '<button class="btn" type="button" data-modal-close>Отмена</button><button class="btn btn-primary" type="button" id="saveSetlistBtn">'+(isEdit?'Сохранить':'Создать')+'</button>',
    {onMount(){$('#saveSetlistBtn').addEventListener('click',async ev=>{
        const btn=ev.currentTarget,name=$('#slName').value.trim();
        if(!name){const er=$('#slError');er.textContent='Введите название сет-листа';er.hidden=false;$('#slName').classList.add('error');$('#slName').focus();return;}
        btn.classList.add('loading');
        const target=sl||{id:uid('set'),items:[],createdAt:nowISO()};
        const prevEv=sl?(State.events.find(x=>x.setlistId===sl.id)||{}).id:null;
        target.name=name;target.groupId=$('#slGroup').value||null;target.status=$('#slStatus').value;target.notes=$('#slNotes').value.trim();
        const newEv=$('#slEvent').value||null;
        await saveSetlist(target);
        if(prevEv&&prevEv!==newEv){const pe=findEvent(prevEv);if(pe){pe.setlistId=null;await saveEvent(pe);}}
        if(newEv){const e2=findEvent(newEv);if(e2){e2.setlistId=target.id;await saveEvent(e2);}}
        if(prefill.songId){const sg=findSong(prefill.songId);
          if(sg&&!(target.items||[]).some(i=>i.songId===sg.id)){target.items=target.items||[];
            target.items.push({id:uid('si'),songId:sg.id,position:target.items.length,keyOverride:null,bpmOverride:null,notes:'',transition:'',leadMemberId:null});
            await saveSetlist(target);}}
        await logActivity('setlist',(isEdit?'Обновлён сет-лист «':'Создан сет-лист «')+name+'»',target.id);
        Modal.close();navigate('#/band/setlist/'+target.id);});}});}
function addSongToSetlist(slId){
  const sl=findSetlist(slId);if(!sl)return;
  if(!State.songs.length){Modal.confirm('Каталог пуст','Сначала добавьте хотя бы одну песню, затем вернитесь к сет-листу.',()=>openSongEditor(),'Добавить песню');return;}
  Modal.show('Добавить песню в «'+sl.name+'»',
    '<div class="filter-search-inline mb-2">'+icon('search',16)+'<input type="search" id="addSongSearch" placeholder="Поиск по названию, автору, тегу…" aria-label="Поиск песен"></div>'+
    '<div class="chip-row mb-2"><label class="chip"><input type="checkbox" id="onlyFav">Только избранные</label>'+
    (State.groups.length?'<select class="form-select" id="addSongGroup" style="width:auto"><option value="">Все группы</option>'+State.groups.map(g=>'<option value="'+g.id+'"'+(sl.groupId===g.id?' selected':'')+'>'+escapeHtml(g.name)+'</option>').join('')+'</select>':'')+'</div>'+
    '<div id="addSongList" style="max-height:44vh;overflow-y:auto"></div>',
    '<button class="btn" type="button" data-modal-close>Готово</button>',
    {onMount(){const render=()=>{
        const q=($('#addSongSearch').value||'').toLowerCase().trim(),fav=$('#onlyFav').checked;
        const gs=$('#addSongGroup'),gid=gs?gs.value:'';
        const inList={};(sl.items||[]).forEach(i=>{inList[i.songId]=true;});
        let songs=State.songs.filter(s=>!inList[s.id]);
        if(fav)songs=songs.filter(s=>s.favorite);
        if(gid)songs=songs.filter(s=>(s.groupIds||[]).indexOf(gid)>=0);
        if(q)songs=songs.filter(s=>(s.title||'').toLowerCase().indexOf(q)>=0||(s.author||'').toLowerCase().indexOf(q)>=0||(s.artist||'').toLowerCase().indexOf(q)>=0||(s.tags||[]).some(t=>String(t).toLowerCase().indexOf(q)>=0));
        songs.sort((a,b)=>(a.title||'').localeCompare(b.title||'','ru'));
        $('#addSongList').innerHTML=songs.length?songs.map(s=>
          '<div class="search-result-item" role="button" tabindex="0" data-add="'+s.id+'"><span class="search-result-icon">🎵</span>'+
          '<div style="flex:1;min-width:0"><div class="search-result-title">'+escapeHtml(s.title)+'</div>'+
          '<div class="search-result-meta">'+escapeHtml([s.key,s.bpm?s.bpm+' BPM':'',s.artist||s.author].filter(Boolean).join(' · ')||'—')+'</div></div>'+
          '<span class="badge badge-accent">'+icon('plus',14)+'</span></div>').join('')
          :'<p class="text-muted text-center" style="padding:20px">Все песни уже добавлены или ничего не найдено</p>';
        $$('[data-add]').forEach(row=>{const go=async()=>{const song=findSong(row.getAttribute('data-add'));if(!song)return;
            sl.items=sl.items||[];sl.items.push({id:uid('si'),songId:song.id,position:sl.items.length,keyOverride:null,bpmOverride:null,notes:'',transition:'',leadMemberId:null});
            await saveSetlist(sl);Modal.close();renderSetlistItems(sl);render();};
          row.addEventListener('click',go);row.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();go();}});});};
      render();
      $('#addSongSearch').addEventListener('input',debounce(render,160),{passive:true});
      $('#onlyFav').addEventListener('change',render,{passive:true});
      const gs=$('#addSongGroup');if(gs)gs.addEventListener('change',render,{passive:true});}});}
async function removeSetlistItem(slId,itemId){const sl=findSetlist(slId);if(!sl)return;
  const i=(sl.items||[]).findIndex(x=>x.id===itemId);if(i<0)return;
  const removed=sl.items[i];sl.items.splice(i,1);await saveSetlist(sl);renderSetlistItems(sl);
  Toast.show('Песня убрана','success',{label:'Вернуть',fn:async()=>{sl.items.splice(i,0,removed);await saveSetlist(sl);renderSetlistItems(sl);}});}
function editSetlistItem(slId,itemId){const sl=findSetlist(slId);if(!sl)return;
  const it=(sl.items||[]).find(x=>x.id===itemId);if(!it)return;
  const s=findSong(it.songId);if(!s){Toast.error('Песня недоступна');return;}
  Modal.show('Параметры песни в сет-листе',
    infoRow('Песня',escapeHtml(s.title))+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="itKey">Тональность (оригинал: '+escapeHtml(s.key||'—')+')</label>'+
      '<input class="form-input" id="itKey" type="text" placeholder="Оставить оригинал" value="'+escapeHtml(it.keyOverride||'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="itBpm">BPM (оригинал: '+(s.bpm||'—')+')</label>'+
      '<input class="form-input" id="itBpm" type="number" min="20" max="400" inputmode="numeric" placeholder="Оставить оригинал" value="'+(it.bpmOverride||'')+'"></div></div>'+
    '<div class="form-group"><label class="form-label" for="itLead">Ответственный / ведущий вокалист</label><select class="form-select" id="itLead"><option value="">—</option>'+
      State.members.map(m=>'<option value="'+m.id+'"'+(it.leadMemberId===m.id?' selected':'')+'>'+escapeHtml(m.name+(m.roles&&m.roles.length?' · '+m.roles.join(', '):''))+'</option>').join('')+'</select></div>'+
    '<div class="form-group"><label class="form-label" for="itTrans">Переход / вступление / финал</label>'+
      '<input class="form-input" id="itTrans" type="text" placeholder="Вступление 8 тактов, переход без паузы" value="'+escapeHtml(it.transition||'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="itNotes">Заметка к песне</label>'+
      '<input class="form-input" id="itNotes" type="text" placeholder="Технические пометки" value="'+escapeHtml(it.notes||'')+'"></div>'+
    (dynRows(s).length?'<div class="form-group"><span class="form-label">Динамика по инструментам (из карточки песни)</span>'+dynamicsHTML(s)+'</div>':'')+
    '<div class="form-error" id="itError" role="alert" hidden></div>',
    '<button class="btn" type="button" data-act="sl-remove" data-sl="'+sl.id+'" data-item="'+it.id+'" data-modal-close>Убрать</button>'+
    '<button class="btn" type="button" data-modal-close>Отмена</button><button class="btn btn-primary" type="button" id="saveItemBtn">Сохранить</button>',
    {size:'modal-lg',onMount(){$('#saveItemBtn').addEventListener('click',async()=>{
        const er=$('#itError'),k=$('#itKey').value.trim(),b=$('#itBpm').value.trim();
        if(k&&!/^[A-G][#b]?/.test(k)){er.textContent='Тональность должна начинаться с ноты A–G';er.hidden=false;return;}
        if(b&&(isNaN(parseInt(b,10))||parseInt(b,10)<20||parseInt(b,10)>400)){er.textContent='BPM: 20–400';er.hidden=false;return;}
        it.keyOverride=k||null;it.bpmOverride=b?parseInt(b,10):null;
        it.leadMemberId=$('#itLead').value||null;it.transition=$('#itTrans').value.trim();it.notes=$('#itNotes').value.trim();
        await saveSetlist(sl);Modal.close();renderSetlistItems(sl);});}});}
async function setSetlistStatus(slId,status){const sl=findSetlist(slId);if(!sl)return;
  sl.status=status;await saveSetlist(sl);
  await logActivity('setlist','Сет-лист «'+sl.name+'» → '+SETLIST_STATUS[status],sl.id);
  renderSetlistDetail(slId);}
async function duplicateSetlist(id){const sl=findSetlist(id);if(!sl)return;
  const c=JSON.parse(JSON.stringify(sl));c.id=uid('set');c.name=sl.name+' (копия)';c.status='draft';c.createdAt=nowISO();c.updatedAt=nowISO();
  (c.items||[]).forEach(i=>{i.id=uid('si');});
  await saveSetlist(c);await logActivity('setlist','Копия сет-листа «'+sl.name+'»',c.id);
  navigate('#/band/setlist/'+c.id);}
function confirmDeleteSetlist(id){const sl=findSetlist(id);if(!sl)return;
  Modal.confirm('Удалить сет-лист?','«'+sl.name+'» будет удалён. Привязанные события останутся, но без программы.',async()=>{
    const copy=JSON.parse(JSON.stringify(sl));await deleteSetlist(id);
    await logActivity('setlist','Удалён сет-лист «'+sl.name+'»',id);
    Toast.show('Сет-лист удалён','success',{label:'Вернуть',fn:async()=>{await saveSetlist(copy);navigate('#/band/setlist/'+copy.id);}});
    navigate('#/band');},'Удалить',true);}
function createSetlistForEvent(eventId){const e=findEvent(eventId);if(!e)return;
  Modal.show('Сет-лист для «'+e.title+'»',
    '<div class="form-group"><label class="form-label" for="qslName">Название</label><input class="form-input" id="qslName" type="text" value="'+escapeHtml(e.title+' — '+formatDateShort(e.start))+'"></div>'+
    '<div class="form-group"><span class="form-label">Добавить песни (необязательно)</span><div style="max-height:200px;overflow-y:auto" id="qslSongs">'+
    (State.songs.length?State.songs.map(s=>'<label class="chip" style="display:flex;margin-bottom:4px"><input type="checkbox" value="'+s.id+'">'+escapeHtml(s.title)+'</label>').join(''):'<p class="form-hint">Каталог пуст — песни можно добавить позже.</p>')+'</div></div>',
    '<button class="btn" type="button" data-modal-close>Отмена</button><button class="btn btn-primary" type="button" id="qslSave">Создать и привязать</button>',
    {onMount(){$('#qslSave').addEventListener('click',async()=>{
        const name=$('#qslName').value.trim();
        if(!name){$('#qslName').classList.add('error');$('#qslName').focus();return;}
        const picked=$$('#qslSongs input:checked').map(c=>c.value);
        const sl={id:uid('set'),name,groupId:e.groupId||null,status:'draft',
          items:picked.map((sid,i)=>({id:uid('si'),songId:sid,position:i,keyOverride:null,bpmOverride:null,notes:'',transition:'',leadMemberId:null})),
          notes:'',createdAt:nowISO(),updatedAt:nowISO()};
        await saveSetlist(sl);e.setlistId=sl.id;await saveEvent(e);
        await logActivity('setlist','Создан сет-лист «'+name+'» для «'+e.title+'»',sl.id);
        Modal.close();navigate('#/band/setlist/'+sl.id);});}});}
function renderGroupDetail(id){
  const g=findGroup(id);if(!g){Toast.error('Группа не найдена');navigate('#/band');return;}
  const members=State.members.filter(m=>(m.groupIds||[]).indexOf(id)>=0);
  const songs=State.songs.filter(s=>(s.groupIds||[]).indexOf(id)>=0);
  const evts=State.events.filter(e=>e.groupId===id).sort((a,b)=>new Date(b.start)-new Date(a.start));
  const upcoming=evts.filter(e=>new Date(e.start)>=new Date()).slice(0,5);
  const past=evts.filter(e=>new Date(e.start)<new Date()).slice(0,8);
  const sls=State.setlists.filter(s=>s.groupId===id);
  $('#content').innerHTML='<div class="page-header"><div>'+
      '<button class="btn btn-sm mb-2" data-go="#/band">'+icon('arrowLeft',16)+'К группам</button>'+
      '<h1 class="page-title">'+escapeHtml(g.name)+(g.status==='archived'?' <span class="badge badge-warning">Архив</span>':'')+'</h1>'+
      '<p class="page-subtitle">'+escapeHtml([g.leader?'Лидер: '+g.leader:null,members.length+' '+plural(members.length,'участник','участника','участников'),songs.length+' '+plural(songs.length,'песня','песни','песен'),g.inviteCode?'Код: '+g.inviteCode:null].filter(Boolean).join(' · '))+'</p></div>'+
    '<div class="page-actions"><button class="btn" type="button" data-act="new-event-group" data-id="'+g.id+'">'+icon('calendar',16)+'Событие</button>'+
      '<button class="btn" type="button" data-act="new-setlist-group" data-id="'+g.id+'">'+icon('list',16)+'Сет-лист</button>'+
      '<button class="btn" type="button" data-act="'+(g.status==='archived'?'unarchive-group':'archive-group')+'" data-id="'+g.id+'">'+icon('archive',16)+(g.status==='archived'?'Из архива':'В архив')+'</button>'+
      '<button class="btn btn-primary" type="button" data-act="edit-group" data-id="'+g.id+'">'+icon('edit',16)+'Изменить</button></div></div>'+
    '<div style="height:5px;background:'+escapeHtml(g.color||'var(--accent)')+';border-radius:3px;margin-bottom:16px"></div>'+
    (g.description?'<section class="card mb-4"><h2 class="section-title">Описание</h2><p style="font-size:14px;color:var(--text-muted);line-height:1.7;white-space:pre-wrap">'+escapeHtml(g.description)+'</p></section>':'')+
    '<section class="card mb-4"><div class="flex items-center justify-between flex-wrap gap-2"><h2 class="section-title" style="margin:0">Участники и роли</h2>'+
      '<button class="btn btn-sm" type="button" data-act="new-member">'+icon('plus',15)+'Участник</button></div>'+
      (members.length?'<div class="grid grid-2 mt-2">'+members.map(m=>'<div class="member-card" data-member="'+m.id+'" role="button" tabindex="0">'+
        '<div class="member-avatar" style="background:'+escapeHtml(m.color||'var(--accent)')+'">'+escapeHtml((m.name||'?')[0].toUpperCase())+'</div>'+
        '<div class="member-info"><div class="member-name">'+escapeHtml(m.name)+'</div><div class="member-roles">'+
        ((m.roles||[]).map(r=>'<span class="role-tag" style="background:'+hexToRgba(ROLE_COLORS[r]||'#9ca3af',0.16)+';color:'+(ROLE_COLORS[r]||'#9ca3af')+'">'+escapeHtml(r)+'</span>').join('')||'—')+'</div></div>'+
        '<span class="badge '+(m.status==='active'?'badge-success':'badge-muted')+'">'+MEMBER_STATUS[m.status||'active']+'</span></div>').join('')+'</div>'
        :'<p class="text-muted mt-2" style="font-size:14px">В группе пока нет участников.</p>')+'</section>'+
    '<section class="card mb-4"><div class="flex items-center justify-between flex-wrap gap-2"><h2 class="section-title" style="margin:0">Песни группы ('+songs.length+')</h2>'+
      '<button class="btn btn-sm" type="button" data-act="group-assign-songs" data-id="'+g.id+'">'+icon('plus',15)+'Назначить песни</button></div>'+
      (songs.length?'<div class="chip-row mt-2">'+songs.slice(0,40).map(s=>'<span class="song-badge" style="font-size:12px;padding:6px 10px">'+
        '<a href="#/songs/'+s.id+'" style="color:inherit">'+escapeHtml(s.title)+'</a> '+
        '<button type="button" data-act="group-unassign-song" data-id="'+g.id+'" data-val="'+s.id+'" aria-label="Убрать" style="color:inherit;opacity:.6">✕</button></span>').join('')+'</div>'
        :'<p class="text-muted mt-2" style="font-size:14px">Песни не назначены.</p>')+'</section>'+
    '<section class="card mb-4"><h2 class="section-title">Ближайшие репетиции и выступления</h2>'+
      (upcoming.length?upcoming.map(e=>occurrenceCardHTML({ev:e,start:new Date(e.start),end:new Date(e.end||e.start),key:e.id,single:true},true)).join(''):'<p class="text-muted" style="font-size:14px">Нет запланированных событий.</p>')+'</section>'+
    '<section class="card mb-4"><h2 class="section-title">Сет-листы группы</h2>'+
      (sls.length?'<div class="grid grid-2">'+sls.map(sl=>{const st=setlistStats(sl);
        return '<article class="song-card" data-sl="'+sl.id+'" role="link" tabindex="0"><div class="song-card-title">'+escapeHtml(sl.name)+'</div>'+
        '<div class="song-card-meta"><span>'+icon('music',13)+' '+st.count+'</span><span>'+icon('clock',13)+' '+durationLabel(st.duration)+'</span></div>'+
        '<div style="margin-top:8px"><span class="badge badge-muted">'+SETLIST_STATUS[sl.status||'active']+'</span></div></article>';}).join('')+'</div>'
        :'<p class="text-muted" style="font-size:14px">Сет-листов пока нет.</p>')+'</section>'+
    '<section class="card mb-4"><h2 class="section-title">История</h2>'+
      (past.length?past.map(e=>occurrenceCardHTML({ev:e,start:new Date(e.start),end:new Date(e.end||e.start),key:e.id,single:true},false)).join(''):'<p class="text-muted" style="font-size:14px">История появится после проведённых событий.</p>')+'</section>'+
    (g.notes?'<section class="card mb-4"><h2 class="section-title">Заметки по группе</h2><p style="font-size:14px;color:var(--text-muted);white-space:pre-wrap">'+escapeHtml(g.notes)+'</p></section>':'')+
    '<div class="flex gap-2 flex-wrap"><button class="btn btn-danger" type="button" data-act="delete-group" data-id="'+g.id+'">'+icon('trash',16)+'Удалить группу</button></div>';}
function openGroupEditor(prefill){
  prefill=prefill||{};const g=prefill.id?findGroup(prefill.id):null,isEdit=!!g;
  const body='<div class="form-group"><label class="form-label" for="grpName">Название *</label>'+
      '<input class="form-input" id="grpName" type="text" maxlength="80" placeholder="Например: Worship Team" value="'+(g?escapeHtml(g.name):'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="grpDesc">Описание</label>'+
      '<textarea class="form-textarea" id="grpDesc" style="min-height:70px;font-family:var(--font);font-size:14px" placeholder="Направление, состав, задачи">'+(g?escapeHtml(g.description||''):'')+'</textarea></div>'+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="grpLeader">Лидер</label><input class="form-input" id="grpLeader" type="text" placeholder="Имя" value="'+(g?escapeHtml(g.leader||''):'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="grpColor">Цвет в календаре</label><input class="form-input" id="grpColor" type="color" style="height:48px;padding:6px" value="'+escapeHtml(g&&g.color?g.color:State.settings.accent)+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="grpInvite">Код приглашения</label><input class="form-input" id="grpInvite" type="text" maxlength="16" placeholder="WT2026" value="'+(g?escapeHtml(g.inviteCode||''):'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="grpStatus">Статус</label><select class="form-select" id="grpStatus">'+
      '<option value="active"'+(!g||g.status==='active'?' selected':'')+'>Активна</option>'+
      '<option value="archived"'+(g&&g.status==='archived'?' selected':'')+'>Архивирована</option></select></div></div>'+
    '<div class="form-group"><span class="form-label">Участники группы</span><div class="chip-row" id="grpMembers">'+
      (State.members.length?State.members.map(m=>{const on=g&&(m.groupIds||[]).indexOf(g.id)>=0;
        return '<label class="chip'+(on?' active':'')+'"><input type="checkbox" value="'+m.id+'"'+(on?' checked':'')+'>'+escapeHtml(m.name)+'</label>';}).join('')
        :'<p class="form-hint">Сначала добавьте участников.</p>')+'</div></div>'+
    '<div class="form-group"><label class="form-label" for="grpNotes">Заметки по группе</label>'+
      '<textarea class="form-textarea" id="grpNotes" style="min-height:64px;font-family:var(--font);font-size:14px" placeholder="Договорённости, техника">'+(g?escapeHtml(g.notes||''):'')+'</textarea></div>'+
    (isEdit?'<div class="form-group"><span class="form-label">Логотип / обложка</span>'+
      (g.logoFileId?'<div class="file-list"><div class="file-row"><span class="f-ico">🖼️</span><span class="f-name">'+escapeHtml((fileMetaById(g.logoFileId)||{}).name||'Логотип')+'</span>'+
        '<button class="btn btn-sm" type="button" data-act="open-file" data-id="'+g.logoFileId+'">Открыть</button>'+
        '<button class="btn btn-sm btn-danger" type="button" data-act="group-remove-logo" data-id="'+g.id+'">Удалить</button></div></div>'
        :'<button class="btn btn-sm" type="button" data-act="attach-logo" data-id="'+g.id+'">'+icon('paperclip',15)+' Загрузить логотип</button>')+'</div>':'')+
    '<div class="form-error" id="grpError" role="alert" hidden></div>';
  Modal.show(isEdit?'Редактировать группу':'Новая группа',body,
    '<button class="btn" type="button" data-modal-close>Отмена</button><button class="btn btn-primary" type="button" id="saveGroupBtn">'+(isEdit?'Сохранить':'Создать')+'</button>',
    {onMount(){$$('#grpMembers input').forEach(cb=>cb.addEventListener('change',()=>cb.closest('.chip').classList.toggle('active',cb.checked),{passive:true}));
      $('#saveGroupBtn').addEventListener('click',async()=>{
        const name=$('#grpName').value.trim();
        if(!name){const er=$('#grpError');er.textContent='Введите название группы';er.hidden=false;$('#grpName').classList.add('error');$('#grpName').focus();return;}
        const group=g?Object.assign({},g):{id:uid('grp'),createdAt:nowISO(),songIds:[],logoFileId:null};
        group.name=name;group.description=$('#grpDesc').value.trim();group.leader=$('#grpLeader').value.trim();
        group.color=$('#grpColor').value||State.settings.accent;group.inviteCode=$('#grpInvite').value.trim().toUpperCase();
        group.status=$('#grpStatus').value;group.notes=$('#grpNotes').value.trim();
        await saveGroup(group);
        const ids=$$('#grpMembers input:checked').map(c=>c.value);
        for(const m of State.members){const has=(m.groupIds||[]).indexOf(group.id)>=0,want=ids.indexOf(m.id)>=0;
          if(has!==want){m.groupIds=want?(m.groupIds||[]).concat([group.id]):(m.groupIds||[]).filter(x=>x!==group.id);await saveMember(m);}}
        await logActivity('group',(isEdit?'Обновлена группа «':'Создана группа «')+name+'»',group.id);
        Modal.close();navigate('#/band/group/'+group.id);});}});}
async function toggleGroupArchive(id){const g=findGroup(id);if(!g)return;
  g.status=g.status==='archived'?'active':'archived';await saveGroup(g);
  await logActivity('group','Группа «'+g.name+'» '+(g.status==='archived'?'архивирована':'возвращена из архива'),g.id);
  handleRoute();}
function confirmDeleteGroup(id){const g=findGroup(id);if(!g)return;
  Modal.confirm('Удалить группу?','«'+g.name+'» будет удалена. События, сет-листы и песни останутся, но потеряют привязку. Чтобы сохранить данные — используйте архивирование.',async()=>{
    const copy=JSON.parse(JSON.stringify(g));
    if(g.logoFileId)await deleteFile(g.logoFileId);
    await deleteGroup(id);await logActivity('group','Удалена группа «'+g.name+'»',id);
    Toast.show('Группа удалена','success',{label:'Вернуть',fn:async()=>{await saveGroup(copy);navigate('#/band/group/'+copy.id);}});
    navigate('#/band');},'Удалить',true);}
function groupAssignSongs(id){const g=findGroup(id);if(!g)return;
  Modal.show('Песни группы «'+g.name+'»',
    '<div class="filter-search-inline mb-2">'+icon('search',16)+'<input type="search" id="gasSearch" placeholder="Поиск песен…" aria-label="Поиск"></div><div id="gasList" style="max-height:50vh;overflow-y:auto"></div>',
    '<button class="btn btn-primary" type="button" data-modal-close>Готово</button>',
    {onMount(){const render=()=>{const q=($('#gasSearch').value||'').toLowerCase();
        const list=State.songs.filter(s=>!q||(s.title||'').toLowerCase().indexOf(q)>=0||(s.artist||'').toLowerCase().indexOf(q)>=0);
        $('#gasList').innerHTML=list.length?list.map(s=>{const on=(s.groupIds||[]).indexOf(g.id)>=0;
          return '<label class="participant-row"><span class="p-name"><input type="checkbox" data-gs="'+s.id+'"'+(on?' checked':'')+' style="accent-color:var(--accent);width:17px;height:17px">'+escapeHtml(s.title)+'</span>'+
            '<span class="badge badge-muted">'+escapeHtml(s.key||'—')+'</span></label>';}).join(''):'<p class="text-muted text-center" style="padding:20px">Каталог пуст</p>';
        $$('[data-gs]').forEach(cb=>cb.addEventListener('change',async()=>{const s=findSong(cb.getAttribute('data-gs'));if(!s)return;
          s.groupIds=s.groupIds||[];
          if(cb.checked&&s.groupIds.indexOf(g.id)<0)s.groupIds.push(g.id);
          if(!cb.checked)s.groupIds=s.groupIds.filter(x=>x!==g.id);
          await saveSong(s);},{passive:true}));};
      render();$('#gasSearch').addEventListener('input',debounce(render,170),{passive:true});}});}
async function groupUnassignSong(gid,songId){const s=findSong(songId);if(!s)return;
  s.groupIds=(s.groupIds||[]).filter(x=>x!==gid);await saveSong(s);handleRoute();}
function openMemberEditor(prefill){
  prefill=prefill||{};const m=prefill.id?findMember(prefill.id):null,isEdit=!!m;
  const c=(m&&m.contacts)||{phone:'',email:'',telegram:'',whatsapp:''};
  const body='<div class="form-row"><div class="form-group"><label class="form-label" for="memName">Имя *</label><input class="form-input" id="memName" type="text" maxlength="80" placeholder="Имя и фамилия" value="'+(m?escapeHtml(m.name):'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="memStatus">Статус</label><select class="form-select" id="memStatus">'+
      Object.keys(MEMBER_STATUS).map(k=>'<option value="'+k+'"'+((m?m.status:'active')===k?' selected':'')+'>'+MEMBER_STATUS[k]+'</option>').join('')+'</select></div></div>'+
    '<div class="form-group"><span class="form-label">Роли и инструменты</span><div class="chip-row" id="memRoles">'+
      allRoles().map(r=>{const on=m&&(m.roles||[]).indexOf(r)>=0;
        return '<label class="chip'+(on?' active':'')+'" style="border-left:3px solid '+(ROLE_COLORS[r]||'#9ca3af')+'"><input type="checkbox" value="'+escapeHtml(r)+'"'+(on?' checked':'')+'>'+escapeHtml(r)+'</label>';}).join('')+
      '</div><button class="btn btn-sm mt-2" type="button" data-act="manage-roles">Управление ролями</button></div>'+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="memPhone">Телефон</label><input class="form-input" id="memPhone" type="tel" inputmode="tel" placeholder="+7 900 000-00-00" value="'+escapeHtml(c.phone||'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="memEmail">Email</label><input class="form-input" id="memEmail" type="email" inputmode="email" placeholder="name@mail.com" value="'+escapeHtml(c.email||'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="memTg">Telegram</label><input class="form-input" id="memTg" type="text" placeholder="@nickname" value="'+escapeHtml(c.telegram||'')+'"></div>'+
    '<div class="form-group"><label class="form-label" for="memWa">WhatsApp</label><input class="form-input" id="memWa" type="text" placeholder="+79000000000" value="'+escapeHtml(c.whatsapp||'')+'"></div></div>'+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="memColor">Цвет аватара</label><input class="form-input" id="memColor" type="color" style="height:48px;padding:6px" value="'+escapeHtml(m&&m.color?m.color:State.settings.accent)+'"></div>'+
    '<div class="form-group"><label class="form-label" for="memNote">Заметка</label><input class="form-input" id="memNote" type="text" placeholder="Например: свой инструмент" value="'+escapeHtml(m&&m.note?m.note:'')+'"></div></div>'+
    '<div class="form-group"><span class="form-label">Группы</span><div class="chip-row" id="memGroups">'+
      (State.groups.length?State.groups.map(g=>{const on=m&&(m.groupIds||[]).indexOf(g.id)>=0;
        return '<label class="chip'+(on?' active':'')+'" style="border-left:3px solid '+escapeHtml(g.color||'var(--accent)')+'"><input type="checkbox" value="'+g.id+'"'+(on?' checked':'')+'>'+escapeHtml(g.name)+'</label>';}).join('')
        :'<p class="form-hint">Группы ещё не созданы.</p>')+'</div></div>'+
    '<div class="form-error" id="memError" role="alert" hidden></div>';
  Modal.show(isEdit?'Редактировать участника':'Новый участник',body,
    (isEdit?'<button class="btn btn-danger" type="button" data-act="delete-member" data-id="'+m.id+'" data-modal-close>'+icon('trash',16)+'</button>':'')+
    '<button class="btn" type="button" data-modal-close>Отмена</button><button class="btn btn-primary" type="button" id="saveMemberBtn">'+(isEdit?'Сохранить':'Добавить')+'</button>',
    {onMount(){$$('#memRoles input, #memGroups input').forEach(cb=>cb.addEventListener('change',()=>cb.closest('.chip').classList.toggle('active',cb.checked),{passive:true}));
      $('#saveMemberBtn').addEventListener('click',async()=>{
        const name=$('#memName').value.trim(),er=$('#memError');
        if(!name){er.textContent='Введите имя участника';er.hidden=false;$('#memName').classList.add('error');$('#memName').focus();return;}
        const email=$('#memEmail').value.trim();
        if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){er.textContent='Некорректный email';er.hidden=false;$('#memEmail').classList.add('error');$('#memEmail').focus();return;}
        const member=m?Object.assign({},m):{id:uid('mem'),createdAt:nowISO()};
        member.name=name;member.status=$('#memStatus').value;
        member.roles=$$('#memRoles input:checked').map(x=>x.value);
        member.groupIds=$$('#memGroups input:checked').map(x=>x.value);
        member.contacts={phone:$('#memPhone').value.trim(),email,telegram:$('#memTg').value.trim(),whatsapp:$('#memWa').value.trim()};
        member.color=$('#memColor').value||State.settings.accent;member.note=$('#memNote').value.trim();member.avatar=name[0].toUpperCase();
        await saveMember(member);await logActivity('member',(isEdit?'Обновлён участник «':'Добавлен участник «')+name+'»',member.id);
        Modal.close();handleRoute();});}});}
function confirmDeleteMember(id){const m=findMember(id);if(!m)return;
  Modal.confirm('Удалить участника?','«'+m.name+'» будет удалён из состава всех событий и групп.',async()=>{
    const copy=JSON.parse(JSON.stringify(m));await deleteMember(id);
    await logActivity('member','Удалён участник «'+m.name+'»',id);
    Toast.show('Участник удалён','success',{label:'Вернуть',fn:async()=>{await saveMember(copy);handleRoute();}});handleRoute();},'Удалить',true);}
function manageRoles(){
  Modal.show('Роли и инструменты',
    '<p class="form-hint">Базовые роли: '+escapeHtml(BASE_ROLES.join(', '))+'. Собственные роли появятся в карточках участников и в редакторе динамики песни.</p>'+
    '<div class="chip-row mt-2" id="customRoles"></div>'+
    '<div class="form-row mt-4"><div class="form-group"><label class="form-label" for="newRole">Новая роль / инструмент</label>'+
    '<input class="form-input" id="newRole" type="text" maxlength="30" placeholder="Например: Flute, Backing vocal"></div>'+
    '<div class="form-group" style="justify-content:flex-end"><label class="form-label">&nbsp;</label><button class="btn btn-sm btn-primary" type="button" id="addRoleBtn">Добавить</button></div></div>'+
    '<div class="form-error" id="roleError" role="alert" hidden></div>',
    '<button class="btn btn-primary" type="button" data-modal-close>Готово</button>',
    {onMount(){const rerender=()=>{const l=State.settings.customRoles||[];
        $('#customRoles').innerHTML=l.length?l.map(r=>'<span class="chip active">'+escapeHtml(r)+' <button type="button" data-rm="'+escapeHtml(r)+'" aria-label="Удалить" style="color:inherit">✕</button></span>').join(''):'<p class="text-muted" style="font-size:13px">Собственные роли не добавлены.</p>';
        $$('[data-rm]').forEach(b=>b.addEventListener('click',()=>{const r=b.getAttribute('data-rm');
          State.settings.customRoles=(State.settings.customRoles||[]).filter(x=>x!==r);
          persistSetting('customRoles',State.settings.customRoles);rerender();}));};
      rerender();
      $('#addRoleBtn').addEventListener('click',()=>{const inp=$('#newRole'),v=inp.value.trim(),er=$('#roleError');
        if(!v){er.textContent='Введите название роли';er.hidden=false;return;}
        if(allRoles().some(r=>r.toLowerCase()===v.toLowerCase())){er.textContent='Такая роль уже существует';er.hidden=false;return;}
        er.hidden=true;State.settings.customRoles=(State.settings.customRoles||[]).concat([v]);
        persistSetting('customRoles',State.settings.customRoles);inp.value='';rerender();});}});}

/* ═══ SECTION 11: SCENE ═══ */
const SPEEDS=[{v:0.5,l:'Очень медленно'},{v:0.75,l:'Медленно'},{v:1,l:'Средне'},{v:1.5,l:'Быстро'},{v:2,l:'Очень быстро'}];
function renderScenePage(){
  const ready=State.setlists.filter(sl=>(sl.items||[]).length&&(sl.status||'active')!=='archived');
  $('#content').innerHTML='<div class="page-header"><div><h1 class="page-title">Сценический режим</h1>'+
      '<p class="page-subtitle">Полноэкранный текст с аккордами, динамикой, автопрокруткой и транспонированием</p></div></div>'+
    (ready.length?'<section class="card mb-4"><h2 class="section-title">Выберите сет-лист</h2><div class="grid grid-2">'+
      ready.map(sl=>{const st=setlistStats(sl);
        return '<button class="quick-action" type="button" data-act="launch-scene" data-id="'+sl.id+'"><span class="quick-action-icon">📋</span>'+
        '<span style="min-width:0"><span class="quick-action-label">'+escapeHtml(sl.name)+'</span><span class="quick-action-sub">'+st.count+' '+plural(st.count,'песня','песни','песен')+' · '+durationLabel(st.duration)+'</span></span></button>';}).join('')+'</div></section>'
      :'<div class="card mb-4">'+emptyBlock('🎬','Нет готовых сет-листов','Сценический режим работает с сет-листом, в котором есть хотя бы одна песня.','new-setlist','Создать сет-лист')+'</div>')+
    '<section class="card mb-4"><h2 class="section-title">Быстрый запуск песни</h2>'+
      (State.songs.length?'<div class="grid grid-2">'+State.songs.slice(0,8).map(s=>'<button class="quick-action" type="button" data-act="scene-from-song" data-id="'+s.id+'"><span class="quick-action-icon">🎵</span>'+
        '<span style="min-width:0"><span class="quick-action-label">'+escapeHtml(s.title)+'</span><span class="quick-action-sub">'+escapeHtml([s.key,s.bpm?s.bpm+' BPM':''].filter(Boolean).join(' · ')||'—')+'</span></span></button>').join('')+'</div>'
        :'<p class="text-muted" style="font-size:14px">Добавьте песни в каталог.</p>')+'</section>'+
    '<section class="card"><h2 class="section-title">Параметры сцены</h2>'+
      '<div class="info-row"><span class="info-label">Размер шрифта</span><span class="info-value"><span class="transpose-controls">'+
        '<button class="transpose-btn" type="button" data-act="scene-font" data-d="-2">−</button><span class="transpose-value" id="sceneFontVal">'+State.ui.scene.font+'</span>'+
        '<button class="transpose-btn" type="button" data-act="scene-font" data-d="2">+</button></span></span></div>'+
      '<div class="info-row"><span class="info-label">Скорость автопрокрутки</span><span class="info-value"><select class="form-select" id="sceneSpeedSel" style="width:auto">'+
        SPEEDS.map(s=>'<option value="'+s.v+'"'+(State.ui.scene.speed===s.v?' selected':'')+'>'+s.l+' ('+s.v+'×)</option>').join('')+'</select></span></div>'+
      '<div class="info-row"><span class="info-label">Не гасить экран</span><span class="info-value" id="wakeStatus">—</span></div>'+
      '<p class="form-hint mt-2">Клавиши: ← → песни, Пробел — прокрутка, + − шрифт, ♭ ♯ транспонирование, Esc — выход. На телефоне: свайп влево/вправо, тап по тексту скрывает панели.</p></section>';
  const sel=$('#sceneSpeedSel');
  if(sel)sel.addEventListener('change',()=>{State.ui.scene.speed=parseFloat(sel.value);persistSetting('autoscrollSpeed',State.ui.scene.speed);updateSceneSpeedLabel();},{passive:true});
  updateWakeStatus();}
function updateWakeStatus(){const el=$('#wakeStatus');if(!el)return;
  el.textContent=!('wakeLock' in navigator)?'не поддерживается браузером':(State.ui.scene.wake?'активно':'доступно — включится на сцене');}
function sceneItems(){
  if(State.ui.scene.setlistId){const sl=findSetlist(State.ui.scene.setlistId);return sl?(sl.items||[]):[];}
  if(State.ui.scene.singleSongId)return [{id:'single',songId:State.ui.scene.singleSongId,keyOverride:null,bpmOverride:null}];
  return [];}
function launchScene(setlistId){const sl=findSetlist(setlistId);
  if(!sl||!(sl.items||[]).length){Toast.warning('В сет-листе нет песен');return;}
  Object.assign(State.ui.scene,{setlistId:sl.id,singleSongId:null,index:0,transpose:0,auto:false});openSceneOverlay();}
function launchSceneFromSong(songId,auto){const s=findSong(songId);if(!s){Toast.error('Песня не найдена');return;}
  Object.assign(State.ui.scene,{setlistId:null,singleSongId:songId,index:0,transpose:State.ui.transpose||0,auto:false});
  openSceneOverlay();if(auto)setTimeout(()=>{if(!State.ui.scene.auto)toggleSceneAuto();},400);}
function launchSceneFromEvent(eventId){const e=findEvent(eventId);if(!e)return;
  if(!e.setlistId){
    Modal.confirm('Сет-лист не назначен','Создать сет-лист для «'+e.title+'», добавить песни и запустить сцену?',()=>createSetlistForEvent(e.id),'Создать сет-лист');return;}
  launchScene(e.setlistId);}
function openSceneOverlay(){const ov=$('#sceneOverlay');ov.classList.add('active');ov.classList.remove('ui-hidden');
  document.body.style.overflow='hidden';renderSceneSong();requestWakeLock();
  if(ov.requestFullscreen)ov.requestFullscreen().catch(()=>{});
  else if(ov.webkitRequestFullscreen){try{ov.webkitRequestFullscreen();}catch(e){}}}
function renderSceneSong(){
  const items=sceneItems();
  if(!items.length){exitScene();return;}
  State.ui.scene.index=clamp(State.ui.scene.index,0,items.length-1);
  const it=items[State.ui.scene.index],song=findSong(it.songId);
  if(!song){sceneNext();return;}
  const t=State.ui.scene.transpose;
  const key=it.keyOverride?transposeKey(it.keyOverride,t):(song.key?transposeKey(song.key,t):'');
  const bpm=it.bpmOverride||song.bpm,lead=it.leadMemberId?findMember(it.leadMemberId):null,dynSum=dynamicsSummary(song);
  $('#sceneSongInfo').innerHTML='<h2>'+escapeHtml(song.title)+'</h2><p>'+
    escapeHtml([key,bpm?bpm+' BPM':'',lead?'🎤 '+lead.name:'',(State.ui.scene.index+1)+' / '+items.length].filter(Boolean).join(' · '))+'</p>'+
    (dynSum?'<div class="scene-dyn">'+icon('sliders',12)+' '+escapeHtml(dynSum)+'</div>':'');
  const lyr=$('#sceneLyrics');
  lyr.style.fontSize=State.ui.scene.font+'px';
  lyr.innerHTML=renderLyrics(song.lyrics,t).replace(/^<div class="lyrics-view">/,'').replace(/<\/div>$/,'');
  lyr.scrollTop=0;
  $('#scenePrev').disabled=State.ui.scene.index===0;
  $('#sceneNext').disabled=State.ui.scene.index>=items.length-1;
  $('#sceneTransVal').textContent=(t>0?'+':'')+t;
  updateSceneProgress();updateSceneSpeedLabel();
  if(State.ui.scene.auto)restartSceneScroll();}
const updateSceneProgress=throttleRAF(function(){const items=sceneItems(),bar=$('#sceneProgressBar');
  if(!bar||!items.length)return;const lyr=$('#sceneLyrics');
  const p=(lyr&&lyr.scrollHeight>lyr.clientHeight)?lyr.scrollTop/(lyr.scrollHeight-lyr.clientHeight):1;
  bar.style.width=clamp(((State.ui.scene.index+p)/items.length)*100,0,100)+'%';});
function updateSceneSpeedLabel(){const b=$('#sceneSpeed');
  if(b)b.textContent=(State.ui.scene.speed%1===0?State.ui.scene.speed.toFixed(0):State.ui.scene.speed.toFixed(2).replace(/0$/,''))+'×';}
function scenePrev(){if(State.ui.scene.index>0){State.ui.scene.index--;renderSceneSong();}}
function sceneNext(){const it=sceneItems();if(State.ui.scene.index<it.length-1){State.ui.scene.index++;renderSceneSong();}}
function sceneFont(d){State.ui.scene.font=clamp(State.ui.scene.font+d,14,60);
  $('#sceneLyrics').style.fontSize=State.ui.scene.font+'px';persistSetting('sceneFontSize',State.ui.scene.font);
  const v=$('#sceneFontVal');if(v)v.textContent=State.ui.scene.font;}
function sceneTranspose(d){State.ui.scene.transpose=clamp(State.ui.scene.transpose+d,-11,11);renderSceneSong();}
function toggleSceneAuto(){State.ui.scene.auto=!State.ui.scene.auto;
  const b=$('#sceneScroll');b.textContent=State.ui.scene.auto?'⏸':'▶';b.classList.toggle('active',State.ui.scene.auto);
  b.setAttribute('aria-label',State.ui.scene.auto?'Пауза автопрокрутки':'Автопрокрутка');
  if(State.ui.scene.auto)startSceneScroll();else stopSceneScroll();}
function startSceneScroll(){stopSceneScroll();
  const lyr=$('#sceneLyrics'),song=findSong((sceneItems()[State.ui.scene.index]||{}).songId);
  const bpm=song&&song.bpm?song.bpm:0,factor=bpm?clamp(bpm/80,0.55,1.9):1;
  const px=State.ui.scene.font*0.55*State.ui.scene.speed*factor;
  let last=performance.now();
  const step=now=>{if(!State.ui.scene.auto)return;
    const dt=Math.min(0.12,(now-last)/1000);last=now;lyr.scrollTop+=px*dt;updateSceneProgress();
    if(lyr.scrollTop+lyr.clientHeight>=lyr.scrollHeight-2){State.ui.scene.auto=false;
      const b=$('#sceneScroll');b.textContent='▶';b.classList.remove('active');return;}
    State.ui.scene.raf=requestAnimationFrame(step);};
  State.ui.scene.raf=requestAnimationFrame(step);}
function restartSceneScroll(){stopSceneScroll();startSceneScroll();}
function stopSceneScroll(){if(State.ui.scene.raf){cancelAnimationFrame(State.ui.scene.raf);State.ui.scene.raf=null;}}
function cycleSceneSpeed(){const v=SPEEDS.map(s=>s.v);State.ui.scene.speed=v[(v.indexOf(State.ui.scene.speed)+1)%v.length];
  persistSetting('autoscrollSpeed',State.ui.scene.speed);updateSceneSpeedLabel();
  const sel=$('#sceneSpeedSel');if(sel)sel.value=String(State.ui.scene.speed);
  if(State.ui.scene.auto)restartSceneScroll();}
async function requestWakeLock(){if(!('wakeLock' in navigator)){updateWakeStatus();return;}
  try{State.ui.scene.wake=await navigator.wakeLock.request('screen');
    State.ui.scene.wake.addEventListener('release',()=>{State.ui.scene.wake=null;updateWakeStatus();});
    updateWakeStatus();}catch(e){State.ui.scene.wake=null;updateWakeStatus();}}
async function releaseWakeLock(){if(State.ui.scene.wake){try{await State.ui.scene.wake.release();}catch(e){}State.ui.scene.wake=null;}updateWakeStatus();}
function sceneFullscreen(){const ov=$('#sceneOverlay');
  if(!document.fullscreenElement&&!document.webkitFullscreenElement){
    if(ov.requestFullscreen)ov.requestFullscreen().catch(()=>{});
    else if(ov.webkitRequestFullscreen){try{ov.webkitRequestFullscreen();}catch(e){}}}
  else if(document.exitFullscreen)document.exitFullscreen().catch(()=>{});
  else if(document.webkitExitFullscreen)document.webkitExitFullscreen();}
function exitScene(){State.ui.scene.auto=false;stopSceneScroll();releaseWakeLock();
  const ov=$('#sceneOverlay');ov.classList.remove('active','ui-hidden');document.body.style.overflow='';
  const b=$('#sceneScroll');if(b){b.textContent='▶';b.classList.remove('active');}
  if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});}
function setupSceneTouch(){const ov=$('#sceneOverlay');let sx=0,sy=0,st=0,moved=false;
  ov.addEventListener('touchstart',e=>{if(!ov.classList.contains('active'))return;const t=e.touches[0];sx=t.clientX;sy=t.clientY;st=Date.now();moved=false;},{passive:true});
  ov.addEventListener('touchmove',e=>{const t=e.touches[0];if(Math.abs(t.clientX-sx)>12||Math.abs(t.clientY-sy)>12)moved=true;},{passive:true});
  ov.addEventListener('touchend',e=>{if(!ov.classList.contains('active'))return;
    const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.4){if(dx>0)scenePrev();else sceneNext();return;}
    if(!moved&&Date.now()-st<300&&t.target.closest&&t.target.closest('.scene-lyrics'))ov.classList.toggle('ui-hidden');},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ov.classList.contains('active')&&!State.ui.scene.wake)requestWakeLock();});}

/* ═══ SECTION 12: PRINT / PDF / EXPORT / IMPORT ═══ */
function songPrintHTML(song,idx,opts){
  const o=Object.assign({},State.settings.print,opts||{});
  const lines=String(song.lyrics||'').split('\n').map(l=>{
    const sec=l.match(/^\s*\[([^\]]+)\]\s*$/);
    if(sec)return '<span class="p-section">'+escapeHtml(sec[1])+'</span>';
    if(o.chords&&isChordLine(l))return escapeHtml(l).replace(/\S+/g,w=>'<b>'+w+'</b>');
    if(isChordLine(l))return '';
    return escapeHtml(l)||'&nbsp;';}).filter(x=>x!=='').join('\n');
  const meta=[];
  if(o.key&&song.key)meta.push('Тональность: '+song.key);
  if(song.bpm)meta.push('BPM: '+song.bpm);
  if(song.timeSignature)meta.push('Размер: '+song.timeSignature);
  if(song.duration)meta.push('Время: '+durationLabel(song.duration));
  if(song.artist||song.author)meta.push((song.artist?'Исполнитель: '+song.artist:'')+(song.author?' · Автор: '+song.author:''));
  if(song.genre)meta.push('Жанр: '+song.genre);
  let dynBlock='';
  if(o.dynamics&&dynRows(song).length){const secs=dynSections(song);
    dynBlock='<h2>Динамика по инструментам</h2><table><thead><tr><th>Инструмент</th>'+secs.map(s=>'<th>'+escapeHtml(s)+'</th>').join('')+'</tr></thead><tbody>'+
      dynRows(song).map(r=>{const m=r.memberId?findMember(r.memberId):null;
        return '<tr><td>'+escapeHtml(r.instrument)+(m?' · '+escapeHtml(m.name):'')+'</td>'+
          secs.map(s=>{const lv=(r.levels&&r.levels[s])||'off';return '<td>'+(lv==='off'?'—':dynLevel(lv).l)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';}
  return '<div class="print-page'+(o.pageBreak?' break':'')+'" style="font-size:'+o.font+'pt">'+
    '<h1>'+(o.numbering?(idx+1)+'. ':'')+escapeHtml(song.title)+'</h1>'+
    (meta.length?'<div class="p-meta">'+escapeHtml(meta.join(' · '))+'</div>':'')+
    '<div class="p-lyrics">'+lines+'</div>'+dynBlock+
    (o.notes&&song.notes?'<h2>Заметки</h2><p style="font-size:'+o.font+'pt">'+escapeHtml(song.notes)+'</p>':'')+'</div>';}
function setlistPrintHTML(sl,mode){
  const st=setlistStats(sl),g=findGroup(sl.groupId),ev=State.events.find(e=>e.setlistId===sl.id);
  const head='<h1>'+escapeHtml(sl.name)+'</h1><div class="p-meta">'+
    escapeHtml([g?'Группа: '+g.name:null,ev?'Событие: '+ev.title+', '+formatDate(ev.start)+' '+formatTime(ev.start):null,
      st.count+' песен · '+durationLabel(st.duration)+(st.avgBpm?' · '+st.avgBpm+' BPM':''),SETLIST_STATUS[sl.status||'active']].filter(Boolean).join(' · '))+'</div>';
  if(mode==='short'){let rows='';
    (sl.items||[]).forEach((it,i)=>{const s=findSong(it.songId);if(!s)return;
      const lead=it.leadMemberId?findMember(it.leadMemberId):null;
      rows+='<tr><td>'+(i+1)+'</td><td>'+escapeHtml(s.title)+'</td><td>'+escapeHtml(it.keyOverride||s.key||'—')+'</td><td>'+
        (it.bpmOverride||s.bpm||'—')+'</td><td>'+durationLabel(s.duration)+'</td><td>'+escapeHtml(lead?lead.name:'')+'</td>'+
        '<td>'+escapeHtml([it.transition,it.notes].filter(Boolean).join(' · '))+'</td></tr>';});
    return '<div class="print-page">'+head+'<table><thead><tr><th>№</th><th>Песня</th><th>Тон.</th><th>BPM</th><th>Время</th><th>Ответственный</th><th>Переход / заметка</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      (sl.notes?'<h2>Общие заметки</h2><p style="white-space:pre-wrap">'+escapeHtml(sl.notes)+'</p>':'')+'</div>';}
  let out='<div class="print-page">'+head+(sl.notes?'<p style="white-space:pre-wrap;margin-bottom:8px">'+escapeHtml(sl.notes)+'</p>':'')+'</div>';
  (sl.items||[]).forEach((it,i)=>{const s=findSong(it.songId);if(!s)return;
    const clone=Object.assign({},s);
    if(it.keyOverride){const semis=semitoneDiff(s.key,it.keyOverride);clone.key=it.keyOverride;clone.lyrics=transposeLyricsText(s.lyrics,semis);}
    const lead=it.leadMemberId?findMember(it.leadMemberId):null;
    out+=songPrintHTML(clone,i,{numbering:true});
    if(it.transition||it.notes||lead)
      out=out.replace(/<\/div>$/,'<p style="font-size:10pt;color:#333">'+escapeHtml([lead?'Ответственный: '+lead.name:'',it.transition?'Переход: '+it.transition:'',it.notes?'Заметка: '+it.notes:''].filter(Boolean).join(' · '))+'</p></div>');});
  return out;}
function semitoneDiff(from,to){const a=parseChord(String(from||'').split(' ')[0]),b=parseChord(String(to||'').split(' ')[0]);
  if(!a||!b)return 0;let d=(b.rootIdx-a.rootIdx)%12;if(d>6)d-=12;if(d<-6)d+=12;return d;}
function openPrintDialog(payload){
  const o=Object.assign({},State.settings.print,payload.options||{});
  Modal.show('Предпросмотр печати',
    '<div class="form-group"><span class="form-label">Что печатать</span><div class="chip-row" id="printOpts">'+
      [['chords','Аккорды'],['dynamics','Динамика'],['notes','Заметки'],['key','Тональность'],['numbering','Номера песен'],['pageBreak','Разрыв страницы']].map(k=>
        '<label class="chip'+(o[k[0]]?' active':'')+'"><input type="checkbox" data-opt="'+k[0]+'"'+(o[k[0]]?' checked':'')+'>'+k[1]+'</label>').join('')+'</div></div>'+
    '<div class="form-row"><div class="form-group"><label class="form-label" for="printFont">Размер шрифта (pt)</label>'+
      '<input class="form-input" id="printFont" type="number" min="8" max="20" step="1" value="'+o.font+'"></div>'+
    '<div class="form-group"><label class="form-label" for="printTranspose">Транспонировать (полутонов)</label>'+
      '<input class="form-input" id="printTranspose" type="number" min="-11" max="11" step="1" value="'+(payload.transpose||0)+'"></div></div>'+
    '<div class="print-preview" id="printPreview">'+payload.build(o,payload.transpose||0)+'</div>',
    '<button class="btn" type="button" data-modal-close>Отмена</button>'+
    '<button class="btn" type="button" id="printPdfBtn">'+icon('download',16)+'Сохранить PDF</button>'+
    '<button class="btn btn-primary" type="button" id="printNowBtn">'+icon('print',16)+'Печать</button>',
    {size:'modal-xl',onMount(){
      const opts=()=>({chords:$('[data-opt="chords"]').checked,dynamics:$('[data-opt="dynamics"]').checked,notes:$('[data-opt="notes"]').checked,
        key:$('[data-opt="key"]').checked,numbering:$('[data-opt="numbering"]').checked,pageBreak:$('[data-opt="pageBreak"]').checked,
        font:parseInt($('#printFont').value,10)||12});
      const refresh=()=>{$('#printPreview').innerHTML=payload.build(opts(),parseInt($('#printTranspose').value,10)||0);};
      $$('#printOpts input').forEach(cb=>cb.addEventListener('change',()=>{cb.closest('.chip').classList.toggle('active',cb.checked);refresh();},{passive:true}));
      $('#printFont').addEventListener('input',debounce(refresh,250),{passive:true});
      $('#printTranspose').addEventListener('input',debounce(refresh,250),{passive:true});
      $('#printNowBtn').addEventListener('click',()=>doPrint($('#printPreview').innerHTML,false));
      $('#printPdfBtn').addEventListener('click',()=>doPrint($('#printPreview').innerHTML,true));}});}
function doPrint(html,asPdf){$('#printArea').innerHTML=html;Modal.close();setTimeout(()=>window.print(),80);}
function printSongs(songs,transpose){openPrintDialog({transpose:transpose||0,
  build:(o,tr)=>songs.map((s,i)=>{const c=Object.assign({},s);
    if(tr){c.key=transposeKey(s.key,tr);c.lyrics=transposeLyricsText(s.lyrics,tr);}
    return songPrintHTML(c,i,o);}).join('')});}
function printSetlistDialog(id,mode){const sl=findSetlist(id);if(!sl)return;openPrintDialog({build:()=>setlistPrintHTML(sl,mode)});}
function buildBackup(){return{app:'BandPlan',formatVersion:3,exportedAt:nowISO(),deviceId:State.settings.deviceId,
  settings:State.settings,profile:State.profile,songs:State.songs,events:State.events,setlists:State.setlists,
  groups:State.groups,members:State.members,songVersions:State.songVersions,
  note:'Вложения (файлы) в JSON-копию не входят: они хранятся локально в IndexedDB устройства.'};}
function exportAll(){if(downloadFile('bandplan-backup-'+toLocalDateInput(new Date())+'.json',JSON.stringify(buildBackup(),null,2))){
    State.settings.lastBackup=nowISO();writePrefs({lastBackup:State.settings.lastBackup});
    if(State.ui.base==='/more')renderMore();}
  else Toast.error('Не удалось создать файл');}
function importFromFile(input){const file=input.files&&input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onerror=()=>{Toast.error('Не удалось прочитать файл');input.value='';};
  reader.onload=()=>{let data;
    try{data=JSON.parse(String(reader.result));}catch(e){Toast.error('Файл повреждён: это не корректный JSON');input.value='';return;}
    if(!data||typeof data!=='object'||!Array.isArray(data.songs)||!Array.isArray(data.events)){
      Toast.error('Неверный формат: ожидался резервный файл BandPlan (songs, events)');input.value='';return;}
    showImportPreview(data,()=>{input.value='';});};
  reader.readAsText(file);}
function showImportPreview(data,done){
  const c={songs:(data.songs||[]).length,events:(data.events||[]).length,setlists:(data.setlists||[]).length,groups:(data.groups||[]).length,members:(data.members||[]).length,versions:(data.songVersions||[]).length};
  const dupS=(data.songs||[]).filter(s=>State.songs.some(x=>x.id===s.id||(x.title===s.title&&x.author===s.author))).length;
  const dupE=(data.events||[]).filter(e=>State.events.some(x=>x.id===e.id)).length;
  const legacy=!data.formatVersion||data.formatVersion<3;
  Modal.show('Проверка перед импортом',
    '<p style="font-size:14px;line-height:1.6">Файл: <strong>'+escapeHtml(data.exportedAt?'от '+formatDate(data.exportedAt):'без даты')+'</strong>'+(data.formatVersion?' · формат v'+data.formatVersion:'')+'</p>'+
    (legacy?'<p class="form-hint">Это копия более старой версии. Данные будут преобразованы в текущий формат (миграция v1 → v3), повторения и напоминания пересчитаны.</p>':'')+
    '<div class="preview-box">'+['Песни: '+c.songs,'События: '+c.events,'Сет-листы: '+c.setlists,'Группы: '+c.groups,'Участники: '+c.members,'Версии песен: '+c.versions].map(x=>'<div>'+escapeHtml(x)+'</div>').join('')+'</div>'+
    (dupS||dupE?'<p class="form-hint mt-2">Совпадений: песни — '+dupS+', события — '+dupE+'. При объединении более свежие записи заменят старые.</p>':'')+
    '<div class="form-group mt-2"><span class="form-label">Режим импорта</span>'+
      '<label class="chip active" style="margin-bottom:6px"><input type="radio" name="impMode" value="merge" checked>Объединить с текущими данными</label>'+
      '<label class="chip"><input type="radio" name="impMode" value="replace">Заменить все данные</label></div>'+
    '<div class="form-error" id="impError" role="alert" hidden></div>',
    '<button class="btn" type="button" data-modal-close>Отмена</button><button class="btn btn-primary" type="button" id="impConfirm">Импортировать</button>',
    {onMount(){
      $$('input[name="impMode"]').forEach(r=>r.addEventListener('change',()=>$$('input[name="impMode"]').forEach(x=>x.closest('.chip').classList.toggle('active',x.checked)),{passive:true}));
      $('#impConfirm').addEventListener('click',async ev=>{
        const btn=ev.currentTarget;btn.classList.add('loading');
        const mode=($$('input[name="impMode"]').find(r=>r.checked)||{}).value||'merge';
        const backup=buildBackup();
        try{await applyImport(data,mode);Modal.close();
          await logActivity('system','Импорт данных ('+mode+'): '+c.songs+' песен, '+c.events+' событий');
          Toast.show('Импорт завершён','success',{label:'Откатить',fn:async()=>{await applyImport(backup,'replace');handleRoute();}});
          handleRoute();}
        catch(err){Logger.error('import',err);
          const e2=$('#impError');
          if(e2){e2.textContent='Импорт не завершён: '+(err&&err.message?err.message:'неизвестная ошибка')+'. Восстанавливаем предыдущие данные…';e2.hidden=false;}
          try{await applyImport(backup,'replace');handleRoute();}catch(e3){Logger.error('rollback',e3);}
          btn.classList.remove('loading');}
        if(done)done();});}});}
async function applyImport(data,mode){
  if(mode==='replace'){await Promise.all(['songs','events','setlists','groups','members','songVersions'].map(s=>dbClear(s)));
    State.songs=[];State.events=[];State.setlists=[];State.groups=[];State.members=[];State.songVersions=[];}
  const upsert=async(arr,store,list,mig)=>{for(const raw of (arr||[])){
      if(!raw||typeof raw!=='object'||!raw.id)continue;
      const rec=mig?mig(JSON.parse(JSON.stringify(raw))):raw;
      const i=list.findIndex(x=>x.id===rec.id);
      if(i>=0){if(new Date(rec.updatedAt||0).getTime()>=new Date(list[i].updatedAt||0).getTime())list[i]=rec;else continue;}
      else list.push(rec);
      await dbPut(store,rec);}};
  await upsert(data.groups,'groups',State.groups,migrateGroup);
  await upsert(data.members,'members',State.members,migrateMember);
  await upsert(data.songs,'songs',State.songs,migrateSong);
  await upsert(data.setlists,'setlists',State.setlists,migrateSetlist);
  await upsert(data.events,'events',State.events,migrateEvent);
  for(const v of (data.songVersions||[]))if(v&&v.id&&!State.songVersions.some(x=>x.id===v.id)){State.songVersions.push(v);await dbPut('songVersions',v);}
  if(data.profile&&mode==='replace'){Object.assign(State.profile,data.profile);writePrefs({profile:State.profile});dbPut('meta',{id:'profile',value:State.profile});}
  rebuildIndex();await refreshAllReminders();queueChange('system','import',uid('imp'));State.notify();}
function toCSV(rows){return rows.map(r=>r.map(c=>{const v=String(c==null?'':c);return /[";\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(';')).join('\r\n');}
function exportChooser(){Modal.sheet('Экспорт данных',[
  {icon:'🗂️',label:'Резервная копия (JSON)',sub:'Все данные приложения',run:()=>exportAll()},
  {icon:'🎵',label:'Все песни (TXT с аккордами и динамикой)',run:()=>runExport('songs-txt')},
  {icon:'📊',label:'Каталог песен (CSV)',run:()=>runExport('songs-csv')},
  {icon:'📅',label:'Расписание событий (CSV)',sub:'Включая повторения на 90 дней',run:()=>runExport('events-csv')},
  {icon:'📋',label:'Все сет-листы (CSV)',run:()=>runExport('setlists-csv')}]);}
function runExport(kind){
  const stamp=toLocalDateInput(new Date());
  if(kind==='songs-txt'){if(!State.songs.length)return;
    downloadFile('bandplan-songs-'+stamp+'.txt',State.songs.map(s=>songToText(s,0)).join('\n\n'+'═'.repeat(50)+'\n\n'),'text/plain;charset=utf-8');return;}
  if(kind==='songs-csv'){const rows=[['Название','Исполнитель','Автор','Тональность','BPM','Размер','Длительность (с)','Жанр','Язык','Теги','Динамика','Избранное','Ссылка','Обновлено']];
    State.songs.forEach(s=>rows.push([s.title,s.artist||'',s.author||'',s.key||'',s.bpm||'',s.timeSignature||'',s.duration||'',s.genre||'',s.language||'',
      (s.tags||[]).join('|'),dynRows(s).map(r=>r.instrument+':'+Object.keys(r.levels||{}).map(k=>k+'='+r.levels[k]).join('/')).join('|'),
      s.favorite?'да':'нет',s.link||'',s.updatedAt||'']));
    downloadFile('bandplan-songs-'+stamp+'.csv',toCSV(rows),'text/csv;charset=utf-8');return;}
  if(kind==='events-csv'){const rows=[['Дата','Начало','Конец','Название','Тип','Повтор','Место','Группа','Сет-лист','Моё участие','Участников','Напоминания','Статус']];
    expandOccurrences(startOfDay(new Date()),new Date(Date.now()+86400000*90)).forEach(o=>{const e=o.ev,sl=e.setlistId?findSetlist(e.setlistId):null;
      rows.push([formatDate(o.start),formatTime(o.start),formatTime(o.end),e.title,EVENT_TYPES[e.type]||'',REPEATS[e.repeat||'none'],e.location||'',groupName(e.groupId),sl?sl.name:'',e.myStatus?MY_STATUS[e.myStatus]:'',(e.participants||[]).length,(e.reminderOffsets||[]).map(reminderLabel).join('|'),e.status||'']);});
    downloadFile('bandplan-events-'+stamp+'.csv',toCSV(rows),'text/csv;charset=utf-8');return;}
  if(kind==='setlists-csv'){const rows=[['Сет-лист','Статус','Группа','№','Песня','Тональность','BPM','Ответственный','Переход','Заметка']];
    State.setlists.forEach(sl=>(sl.items||[]).forEach((it,i)=>{const s=findSong(it.songId)||{},lead=it.leadMemberId?findMember(it.leadMemberId):null;
      rows.push([sl.name,SETLIST_STATUS[sl.status||'active'],groupName(sl.groupId),i+1,s.title||'—',it.keyOverride||s.key||'',it.bpmOverride||s.bpm||'',lead?lead.name:'',it.transition||'',it.notes||'']);}));
    downloadFile('bandplan-setlists-'+stamp+'.csv',toCSV(rows),'text/csv;charset=utf-8');}}
function bulkExportSelection(){const songs=Array.from(State.ui.selection).map(findSong).filter(Boolean);
  if(!songs.length)return;
  Modal.sheet('Экспорт выбранных ('+songs.length+')',[
    {icon:'📄',label:'Текст с аккордами и динамикой (TXT)',run:()=>{downloadFile('bandplan-selected-'+toLocalDateInput(new Date())+'.txt',songs.map(s=>songToText(s,0)).join('\n\n'+'═'.repeat(40)+'\n\n'),'text/plain;charset=utf-8');}},
    {icon:'📊',label:'Таблица (CSV)',run:()=>{const rows=[['Название','Исполнитель','Тональность','BPM','Размер','Жанр','Длительность (с)']];
      songs.forEach(s=>rows.push([s.title,s.artist||s.author||'',s.key||'',s.bpm||'',s.timeSignature||'',s.genre||'',s.duration||'']));
      downloadFile('bandplan-selected-'+toLocalDateInput(new Date())+'.csv',toCSV(rows),'text/csv;charset=utf-8');}},
    {icon:'🗂️',label:'Данные (JSON)',run:()=>{downloadFile('bandplan-songs-selected.json',JSON.stringify({app:'BandPlan',formatVersion:3,exportedAt:nowISO(),songs,events:[],setlists:[],groups:[],members:[]},null,2));}}]);}
function bulkAddToSetlist(){const ids=Array.from(State.ui.selection);
  if(!ids.length)return;
  if(!State.setlists.length){Modal.confirm('Нет сет-листов','Создать сет-лист и добавить в него выбранные песни?',()=>openSetlistEditor({}),'Создать сет-лист');return;}
  Modal.show('Добавить '+ids.length+' '+plural(ids.length,'песню','песни','песен')+' в сет-лист',
    '<div class="form-group"><label class="form-label" for="bulkSl">Сет-лист</label><select class="form-select" id="bulkSl">'+
    State.setlists.map(s=>'<option value="'+s.id+'">'+escapeHtml(s.name)+'</option>').join('')+'</select></div>',
    '<button class="btn" type="button" data-modal-close>Отмена</button><button class="btn btn-primary" type="button" id="bulkSlGo">Добавить</button>',
    {onMount(){$('#bulkSlGo').addEventListener('click',async()=>{const sl=findSetlist($('#bulkSl').value);if(!sl)return;
        sl.items=sl.items||[];
        ids.forEach(id=>{if(!sl.items.some(i=>i.songId===id))sl.items.push({id:uid('si'),songId:id,position:sl.items.length,keyOverride:null,bpmOverride:null,notes:'',transition:'',leadMemberId:null});});
        await saveSetlist(sl);await logActivity('setlist','Песни добавлены в «'+sl.name+'»',sl.id);
        Modal.close();State.ui.selection.clear();renderSongList();renderSelectionBar();});}});}
async function bulkFavorite(){const ids=Array.from(State.ui.selection);if(!ids.length)return;
  const allFav=ids.every(id=>{const s=findSong(id);return s&&s.favorite;});
  for(const id of ids){const s=findSong(id);if(s){s.favorite=!allFav;await saveSong(s);}}
  renderSongList();}
function bulkDelete(){const ids=Array.from(State.ui.selection);if(!ids.length)return;
  Modal.confirm('Удалить выбранные песни?','Будет удалено '+ids.length+' '+plural(ids.length,'песня','песни','песен')+' из каталога и из всех сет-листов.',async()=>{
    const copies=ids.map(findSong).filter(Boolean).map(s=>JSON.parse(JSON.stringify(s)));
    for(const id of ids)await deleteSong(id);
    await logActivity('song','Массовое удаление: '+ids.length+' песен');
    State.ui.selection.clear();
    Toast.show('Удалено: '+ids.length,'success',{label:'Вернуть',fn:async()=>{for(const c of copies)await saveSong(c);handleRoute();}});
    handleRoute();},'Удалить',true);}

/* ═══ SECTION 13: НАСТРОЙКИ (вкладка «Ещё») ═══ */
function renderMore(){
  const s=State.settings,pending=State.syncQueue.filter(q=>!q.synced).length;
  const themeBtns=[['light','Светлая'],['dark','Тёмная'],['amoled','AMOLED'],['system','Системная']].map(t=>
    '<button class="btn'+(((t[0]==='system')?s.systemTheme:(!s.systemTheme&&s.theme===t[0]))?' btn-primary':'')+'" type="button" data-act="set-theme" data-val="'+t[0]+'">'+t[1]+'</button>').join('');
  const stats=[['Песен',State.songs.length],['Событий',State.events.length],['Сет-листов',State.setlists.length],['Групп',State.groups.length],
    ['Участников',State.members.length],['Файлов',State.fileMeta.length],['Версий',State.songVersions.length],['Напоминаний',State.reminders.filter(r=>!r.fired).length]]
    .map(x=>'<div class="stat-card"><div class="stat-value">'+x[1]+'</div><div class="stat-label">'+x[0]+'</div></div>').join('');
  $('#content').innerHTML='<div class="page-header"><div><h1 class="page-title">Настройки</h1>'+
      '<p class="page-subtitle">Персонализация, уведомления, данные и установка приложения</p></div></div>'+
    '<section class="card mb-4"><h2 class="section-title">Профиль</h2>'+
      '<div class="form-row"><div class="form-group"><label class="form-label" for="profName">Ваше имя</label><input class="form-input" id="profName" type="text" maxlength="80" placeholder="Имя" value="'+escapeHtml(State.profile.name||'')+'"></div>'+
      '<div class="form-group"><label class="form-label" for="profRole">Роль в группе</label><input class="form-input" id="profRole" type="text" maxlength="60" placeholder="Например: Keyboard" value="'+escapeHtml(State.profile.role||'')+'"></div></div>'+
      '<div class="form-group"><span class="form-label">Моё участие по умолчанию</span><div class="part-switch" id="profPart">'+
        ['yes','maybe','no'].map(k=>'<button class="part-btn'+((State.profile.defaultParticipation||'yes')===k?' on':'')+'" type="button" data-val="'+k+'">'+MY_STATUS[k]+'</button>').join('')+'</div></div>'+
      '<button class="btn btn-sm btn-primary mt-2" type="button" id="saveProfileBtn">Сохранить профиль</button></section>'+
    '<section class="card mb-4"><h2 class="section-title">Оформление и персонализация</h2>'+
      '<div class="form-group"><span class="form-label">Тема</span><div class="flex gap-2 flex-wrap">'+themeBtns+'</div></div>'+
      '<div class="form-group mt-4"><span class="form-label">Акцентный цвет интерфейса</span><div class="chip-row" id="accentRow">'+
        ACCENTS.map(a=>'<button class="accent-swatch'+(s.accent===a?' on':'')+'" type="button" data-act="set-accent" data-val="'+a+'" style="background:'+a+'" aria-label="Цвет '+a+'"></button>').join('')+
        '<label class="chip" style="gap:8px">Свой<input type="color" id="accentCustom" value="'+escapeHtml(s.accent)+'" style="width:32px;height:28px;border:none;background:none;padding:0" aria-label="Свой цвет"></label></div></div>'+
      '<div class="form-group mt-4"><label class="form-label" for="lyricsFont">Размер шрифта текстов песен: <b id="lyricsFontVal">'+s.lyricsFont+'px</b></label>'+
        '<input class="range-input" id="lyricsFont" type="range" min="12" max="26" step="1" value="'+s.lyricsFont+'"></div>'+
      '<div class="form-group mt-2"><label class="form-label" for="sceneFontSet">Размер шрифта на сцене: <b id="sceneFontSetVal">'+s.sceneFontSize+'px</b></label>'+
        '<input class="range-input" id="sceneFontSet" type="range" min="16" max="48" step="1" value="'+s.sceneFontSize+'"></div>'+
      '<div class="info-row"><span class="info-label">Формат аккордов</span><span class="info-value"><select class="form-select" id="chordFmt" style="width:auto">'+
        [['auto','Как в оригинале'],['sharp','Диезы (C#, F#)'],['flat','Бемоли (Db, Gb)']].map(o=>'<option value="'+o[0]+'"'+(s.chordFormat===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></span></div>'+
      '<div class="info-row"><span class="info-label">Уменьшить анимацию</span><span class="info-value"><label class="chip'+(s.reducedMotion?' active':'')+'"><input type="checkbox" id="setReduced"'+(s.reducedMotion?' checked':'')+'>Reduced motion</label></span></div></section>'+
    '<section class="card mb-4"><h2 class="section-title">Формат даты, времени и недели</h2>'+
      '<div class="info-row"><span class="info-label">Формат даты</span><span class="info-value"><select class="form-select" id="setDateFormat" style="width:auto">'+
        [['long','5 марта 2026'],['short','5 мар. 26'],['numeric','05.03.2026']].map(o=>'<option value="'+o[0]+'"'+(s.dateFormat===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></span></div>'+
      '<div class="info-row"><span class="info-label">Формат времени</span><span class="info-value"><select class="form-select" id="setTimeFormat" style="width:auto">'+
        [['24','24 часа (18:30)'],['12','12 часов (6:30 PM)']].map(o=>'<option value="'+o[0]+'"'+(String(s.timeFormat)===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></span></div>'+
      '<div class="info-row"><span class="info-label">Первый день недели</span><span class="info-value"><select class="form-select" id="setWeekStart" style="width:auto">'+
        '<option value="1"'+(s.weekStart!==0?' selected':'')+'>Понедельник</option><option value="0"'+(s.weekStart===0?' selected':'')+'>Воскресенье</option></select></span></div>'+
      '<div class="info-row"><span class="info-label">Вид календаря по умолчанию</span><span class="info-value"><select class="form-select" id="setDefView" style="width:auto">'+
        [['month','Месяц'],['week','Неделя'],['day','День'],['agenda','Список']].map(o=>'<option value="'+o[0]+'"'+(s.defaultView===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></span></div></section>'+
    '<section class="card mb-4"><h2 class="section-title">Уведомления и напоминания</h2>'+
      '<div class="info-row"><span class="info-label">Системные уведомления</span><span class="info-value">'+
        ('Notification' in window?(Notification.permission==='granted'?'<span class="badge badge-success">Разрешены</span>':Notification.permission==='denied'?'<span class="badge badge-danger">Запрещены браузером</span>':'<button class="btn btn-sm" type="button" data-act="enable-notifications">Включить</button>'):'<span class="badge badge-muted">Не поддерживаются</span>')+'</span></div>'+
      '<div class="info-row"><span class="info-label">Проверять напоминания</span><span class="info-value"><label class="chip'+(s.notifications?' active':'')+'"><input type="checkbox" id="setNotif"'+(s.notifications?' checked':'')+'>Включено</label></span></div>'+
      '<div class="form-group mt-2"><span class="form-label">Напоминания по умолчанию для новых событий</span><div class="chip-row" id="defRems">'+
        REMINDER_OPTIONS.map(o=>'<label class="chip'+((s.reminderDefaults||[]).indexOf(o.v)>=0?' active':'')+'"><input type="checkbox" value="'+o.v+'"'+((s.reminderDefaults||[]).indexOf(o.v)>=0?' checked':'')+'>'+o.l+'</label>').join('')+'</div></div>'+
      '<p class="form-hint mt-2">Активных напоминаний: '+State.reminders.filter(r=>!r.fired).length+'.</p>'+
      '<button class="btn btn-sm mt-2" type="button" data-act="test-notification">'+icon('bell',15)+'Проверить уведомление</button></section>'+
    '<section class="card mb-4"><h2 class="section-title">Печать и PDF</h2>'+
      '<div class="form-group"><label class="form-label" for="printFontSet">Базовый размер шрифта: <b id="printFontVal">'+s.print.font+'pt</b></label>'+
        '<input class="range-input" id="printFontSet" type="range" min="9" max="18" step="1" value="'+s.print.font+'"></div>'+
      '<div class="chip-row mt-2" id="printDefaults">'+
        [['chords','Аккорды'],['dynamics','Динамика'],['notes','Заметки'],['key','Тональность'],['numbering','Нумерация'],['pageBreak','Разрыв страницы']].map(k=>
          '<label class="chip'+(s.print[k[0]]?' active':'')+'"><input type="checkbox" data-p="'+k[0]+'"'+(s.print[k[0]]?' checked':'')+'>'+k[1]+'</label>').join('')+'</div>'+
      '<p class="form-hint mt-2">PDF создаётся системным диалогом печати: выберите «Сохранить как PDF».</p></section>'+
    '<section class="card mb-4"><h2 class="section-title">Резервное копирование, импорт и экспорт</h2>'+
      '<div class="info-row"><span class="info-label">Последняя копия</span><span class="info-value">'+escapeHtml(s.lastBackup?formatDate(s.lastBackup)+' '+formatTime(s.lastBackup):'не создавалась')+'</span></div>'+
      '<div class="flex gap-2 mt-2 flex-wrap"><button class="btn" type="button" data-act="export">'+icon('download',16)+'Экспорт</button>'+
      '<button class="btn" type="button" data-act="backup-now">'+icon('copy',16)+'Создать копию</button>'+
      '<button class="btn" type="button" data-act="import">'+icon('upload',16)+'Импорт JSON</button></div>'+
      '<p class="form-hint mt-2">Резервная копия включает песни, события, сет-листы, группы, участников, версии и настройки. Вложения хранятся локально и в JSON не входят.</p></section>'+
    '<section class="card mb-4"><h2 class="section-title">Хранилище и вложенные файлы</h2><div id="storageInfo">Оценка хранилища…</div><div id="filesList" class="mt-2"></div>'+
      '<button class="btn btn-sm mt-2" type="button" data-act="persist-storage">Запросить постоянное хранение</button></section>'+
    '<section class="card mb-4"><h2 class="section-title">Аккаунт и синхронизация</h2>'+
      '<div class="info-row"><span class="info-label">Режим</span><span class="info-value">Offline-first · '+(navigator.onLine?'сеть доступна':'нет сети')+'</span></div>'+
      '<div class="info-row"><span class="info-label">Хранилище</span><span class="info-value">'+(storageMode==='indexeddb'?'IndexedDB (локально)':'Память сессии')+'</span></div>'+
      '<div class="info-row"><span class="info-label">Очередь синхронизации</span><span class="info-value">'+pending+' '+plural(pending,'запись','записи','записей')+'</span></div>'+
      '<div class="info-row"><span class="info-label">Идентификатор устройства</span><span class="info-value" style="font-family:var(--font-mono);font-size:12px">'+escapeHtml(s.deviceId||'—')+'</span></div>'+
      '<p class="form-hint mt-2">Облачный сервер не подключён: изменения сохраняются на устройстве и попадают в очередь синхронизации. Подключение Supabase / Firebase / REST выполняется отдельным модулем без изменения интерфейса.</p>'+
      '<button class="btn btn-sm mt-2" type="button" data-act="logout">Выйти из профиля</button></section>'+
    '<section class="card mb-4"><h2 class="section-title">Установка как приложение</h2>'+
      '<div class="info-row"><span class="info-label">Статус</span><span class="info-value" id="installStatus">'+(isStandalone()?'Установлено':(deferredPrompt?'Готово к установке':detectPlatformHint()))+'</span></div>'+
      '<button class="btn btn-primary mt-2" type="button" data-act="install-app">Установить BandPlan</button>'+
      '<p class="form-hint mt-2">Иконка на главном экране телефона или в меню приложений компьютера, запуск в отдельном окне, работа без интернета.</p></section>'+
    '<section class="card mb-4"><h2 class="section-title">Роли</h2><div class="chip-row mb-2">'+
      allRoles().map(r=>'<span class="role-tag" style="background:'+hexToRgba(ROLE_COLORS[r]||'#9ca3af',0.16)+';color:'+(ROLE_COLORS[r]||'#9ca3af')+'">'+escapeHtml(r)+'</span>').join('')+'</div>'+
      '<button class="btn btn-sm" type="button" data-act="manage-roles">'+icon('edit',15)+'Управление ролями</button></section>'+
    '<section class="card mb-4"><h2 class="section-title">Данные приложения</h2><div class="grid grid-4 mb-4">'+stats+'</div>'+
      '<div class="flex gap-2 flex-wrap"><button class="btn" type="button" data-act="reset-demo">'+icon('refresh',16)+'Демо-данные</button>'+
      '<button class="btn btn-danger" type="button" data-act="clear-all">'+icon('trash',16)+'Очистить всё</button></div></section>'+
    '<section class="card mb-4"><h2 class="section-title">Сценический режим</h2>'+
      '<p class="text-muted" style="font-size:14px;line-height:1.6;margin-bottom:12px">Полноэкранный режим для выступления: крупный текст, динамика по инструментам, автопрокрутка по темпу, транспонирование.</p>'+
      '<button class="btn btn-primary" type="button" data-go="#/scene">'+icon('stage',16)+'Открыть сцену</button></section>'+
    '<section class="card mb-4"><h2 class="section-title">Горячие клавиши</h2>'+
      [['Ctrl / Cmd + K','Палитра команд и поиск'],['N','Новая песня'],['E','Новое событие'],['S','Новый сет-лист'],
       ['G, затем C / S / B','Главная / Песни / Сет-листы'],['Ctrl / Cmd + S','Сохранить в редакторе'],['Esc','Закрыть окно, фильтр или выйти со сцены'],
       ['← →','Сцена: песни · Календарь: навигация'],['Пробел','Сцена: автопрокрутка'],['+ / −','Сцена: размер шрифта'],['?','Эта справка']]
        .map(r=>hotkeyRow(r[0],r[1])).join('')+'</section>'+
    '<section class="card mb-4"><h2 class="section-title">Помощь и обратная связь</h2><div class="sheet-list">'+
      '<button class="sheet-item" type="button" data-act="show-help"><span class="si-icon">❓</span><span>Как пользоваться BandPlan<small>Группа → песни → динамика → сет-лист → событие → сцена</small></span></button>'+
      '<a class="sheet-item" href="mailto:support@bandplan.app?subject=BandPlan%20—%20обратная%20связь"><span class="si-icon">✉️</span><span>Написать в поддержку<small>Опишите проблему — ответим на указанный адрес</small></span></a>'+
      '<button class="sheet-item" type="button" data-act="show-privacy"><span class="si-icon">🔒</span><span>Политика конфиденциальности<small>Где хранятся данные и кто имеет к ним доступ</small></span></button></div></section>'+
    '<section class="card"><h2 class="section-title">О приложении</h2>'+
      '<p style="font-size:14px;color:var(--text-muted);line-height:1.7"><strong>BandPlan</strong> — операционная система музыкального коллектива: календарь с напоминаниями и повторами, каталог песен с аккордами, транспонированием и динамикой по инструментам, сет-листы, группы, участники и роли, сценический режим, печать и PDF, резервные копии.</p>'+
      '<p class="form-hint mt-2">Версия 4.1 · 3 файла · IndexedDB · PWA · Русская локализация · Без внешних сервисов и передачи данных</p></section>';
  bindMoreControls();renderStorageInfo();}
function hotkeyRow(k,d){return '<div class="info-row"><span class="info-label"><kbd style="font-family:var(--font);background:var(--surface-3);padding:2px 8px;border-radius:6px;box-shadow:var(--shadow-clay-inset)">'+escapeHtml(k)+'</kbd></span>'+
  '<span class="info-value" style="font-weight:500;color:var(--text-muted)">'+escapeHtml(d)+'</span></div>';}
function bindMoreControls(){
  const bind=(sel,ev,fn,o)=>{const e=$(sel);if(e)e.addEventListener(ev,fn,o||{passive:true});};
  bind('#saveProfileBtn','click',async()=>{const name=$('#profName').value.trim();
    if(!name){$('#profName').classList.add('error');$('#profName').focus();return;}
    State.profile.name=name;State.profile.role=$('#profRole').value.trim();
    writePrefs({profile:State.profile});await dbPut('meta',{id:'profile',value:State.profile});});
  $$('#profPart .part-btn').forEach(b=>b.addEventListener('click',async()=>{
    State.profile.defaultParticipation=b.getAttribute('data-val');
    $$('#profPart .part-btn').forEach(x=>x.classList.toggle('on',x===b));
    writePrefs({profile:State.profile});await dbPut('meta',{id:'profile',value:State.profile});}));
  bind('#accentCustom','input',debounce(ev=>{applyAccent(ev.target.value);$$('#accentRow .accent-swatch').forEach(x=>x.classList.remove('on'));buildManifest();},200));
  bind('#lyricsFont','input',ev=>{const v=parseInt(ev.target.value,10);$('#lyricsFontVal').textContent=v+'px';
    persistSetting('lyricsFont',v);document.documentElement.style.setProperty('--lyrics-font',v+'px');});
  bind('#sceneFontSet','input',ev=>{const v=parseInt(ev.target.value,10);$('#sceneFontSetVal').textContent=v+'px';
    persistSetting('sceneFontSize',v);State.ui.scene.font=v;});
  bind('#chordFmt','change',ev=>{persistSetting('chordFormat',ev.target.value);handleRoute();});
  bind('#setReduced','change',ev=>{persistSetting('reducedMotion',ev.target.checked);ev.target.closest('.chip').classList.toggle('active',ev.target.checked);applyReducedMotion();});
  bind('#setDateFormat','change',ev=>{persistSetting('dateFormat',ev.target.value);handleRoute();});
  bind('#setTimeFormat','change',ev=>{persistSetting('timeFormat',ev.target.value);handleRoute();});
  bind('#setWeekStart','change',ev=>{persistSetting('weekStart',parseInt(ev.target.value,10));handleRoute();});
  bind('#setDefView','change',ev=>{persistSetting('defaultView',ev.target.value);State.ui.calendarView=ev.target.value;});
  bind('#setNotif','change',ev=>{persistSetting('notifications',ev.target.checked);ev.target.closest('.chip').classList.toggle('active',ev.target.checked);
    if(ev.target.checked)checkReminders();});
  $$('#defRems input').forEach(cb=>cb.addEventListener('change',()=>{
    persistSetting('reminderDefaults',$$('#defRems input:checked').map(x=>parseInt(x.value,10)));
    cb.closest('.chip').classList.toggle('active',cb.checked);},{passive:true}));
  bind('#printFontSet','input',ev=>{const v=parseInt(ev.target.value,10);$('#printFontVal').textContent=v+'pt';
    State.settings.print.font=v;writePrefs({print:State.settings.print});});
  $$('#printDefaults input').forEach(cb=>cb.addEventListener('change',()=>{
    State.settings.print[cb.getAttribute('data-p')]=cb.checked;writePrefs({print:State.settings.print});
    cb.closest('.chip').classList.toggle('active',cb.checked);},{passive:true}));
  const imp=$('#importFile');if(imp)imp.addEventListener('change',()=>importFromFile(imp),{passive:true});}
async function renderStorageInfo(){
  const el=$('#storageInfo'),filesEl=$('#filesList');if(!el)return;
  let usageText='Оценка недоступна в этом браузере';
  if(navigator.storage&&navigator.storage.estimate){
    try{const est=await navigator.storage.estimate();
      usageText='Занято '+bytesLabel(est.usage||0)+' из '+bytesLabel(est.quota||0)+(navigator.storage.persisted?' · постоянное хранение включено':'');}
    catch(e){Logger.warn('estimate',e);}}
  const total=State.fileMeta.reduce((a,f)=>a+(f.size||0),0);
  el.innerHTML='<div class="info-row"><span class="info-label">Хранилище браузера</span><span class="info-value">'+escapeHtml(usageText)+'</span></div>'+
    '<div class="info-row"><span class="info-label">Вложений</span><span class="info-value">'+State.fileMeta.length+' · '+bytesLabel(total)+'</span></div>';
  if(filesEl)filesEl.innerHTML=State.fileMeta.length?'<div class="file-list">'+State.fileMeta.slice(0,30).map(f=>{
      const owner=f.ownerId?(findSong(f.ownerId)?findSong(f.ownerId).title:(findEvent(f.ownerId)?findEvent(f.ownerId).title:(findGroup(f.ownerId)?findGroup(f.ownerId).name:''))):'';
      return '<div class="file-row"><span class="f-ico">'+fileIcon(f.type)+'</span><span class="f-name">'+escapeHtml(f.name)+(owner?' <small class="text-muted">· '+escapeHtml(owner)+'</small>':'')+'</span>'+
        '<span class="f-size">'+bytesLabel(f.size)+'</span><button class="btn btn-sm" type="button" data-act="open-file" data-id="'+f.id+'">Открыть</button>'+
        '<button class="btn btn-sm btn-danger" type="button" data-act="delete-file" data-id="'+f.id+'" aria-label="Удалить">'+icon('trash',15)+'</button></div>';}).join('')+
      (State.fileMeta.length>30?'<p class="form-hint">Показаны первые 30 файлов из '+State.fileMeta.length+'.</p>':'')+'</div>':'<p class="form-hint">Вложений нет.</p>';}
async function persistStorage(){
  if(!(navigator.storage&&navigator.storage.persist)){Toast.warning('Постоянное хранение не поддерживается этим браузером');return;}
  try{await navigator.storage.persist();renderStorageInfo();}
  catch(e){Toast.error('Не удалось запросить постоянное хранение');}}
function showHelp(){
  Modal.show('Как пользоваться BandPlan',
    '<div class="preview-box" style="max-height:56vh">'+
    '<h2 style="font-size:15px;margin-bottom:6px">1. Группа и участники</h2><p>«Сет-листы и группы» → Группы → Создать группу. Во вкладке «Участники» добавьте музыкантов, роли (включая собственные) и контакты.</p>'+
    '<h2 style="font-size:15px;margin:12px 0 6px">2. Песни и динамика</h2><p>«Песни» → Песня. Вставьте текст, аккорды отдельной строкой, укажите тональность, BPM, размер, жанр, язык, теги. В блоке «Динамика по инструментам» нажмите «Инструмент», выберите музыканта и нажимайте кнопки секций, чтобы менять уровень: — не играет, p, mp, mf, f, ff. «Заполнить всё…» задаёт уровень для всех секций, «Обновить секции» перечитывает секции из текста.</p>'+
    '<h2 style="font-size:15px;margin:12px 0 6px">3. Фильтры</h2><p>На главной и в песнях все категории спрятаны в выпадающий список «Фильтры»: поиск, группа, категории событий, участие, жанр, тональность, язык, сортировка. Счётчик на кнопке показывает число активных фильтров.</p>'+
    '<h2 style="font-size:15px;margin:12px 0 6px">4. События</h2><p>Тип, дата, время, место, группа, участники со статусами, напоминания и повторения. События можно перетаскивать и менять длительность.</p>'+
    '<h2 style="font-size:15px;margin:12px 0 6px">5. Сет-листы и сцена</h2><p>Соберите программу, задайте тональность, темп, ответственного и переход для каждой песни, затем запустите сцену.</p>'+
    '<h2 style="font-size:15px;margin:12px 0 6px">6. Печать, PDF, экспорт</h2><p>Предпросмотр с выбором элементов (аккорды, динамика, заметки, нумерация, разрыв страниц), печать или «Сохранить как PDF». Экспорт JSON / TXT / CSV в настройках.</p>'+
    '<h2 style="font-size:15px;margin:12px 0 6px">7. Мобильная навигация</h2><p>Свайп влево/вправо переключает вкладки нижней панели: Главная → Песни → Сет-листы → Ещё.</p></div>',
    '<button class="btn btn-primary" type="button" data-modal-close>Понятно</button>',{size:'modal-lg'});}
function showPrivacy(){
  Modal.show('Политика конфиденциальности',
    '<div class="preview-box" style="max-height:56vh">'+
    '<p><strong>Где хранятся данные.</strong> Все данные BandPlan (песни, аккорды, динамика, события, сет-листы, группы, участники, контакты, напоминания и файлы) хранятся локально на устройстве в IndexedDB. Сервера у приложения нет.</p>'+
    '<p><strong>Передача данных.</strong> BandPlan не передаёт данные третьим лицам. Они покидают устройство только при вашем экспорте файла или открытии внешней ссылки.</p>'+
    '<p><strong>Уведомления.</strong> Напоминания обрабатываются локально, разрешение запрашивает браузер.</p>'+
    '<p><strong>Установка приложения.</strong> При установке как PWA данные хранятся в профиле браузера. Очистка данных браузера удаляет базу — используйте резервные копии.</p>'+
    '<p><strong>Удаление данных.</strong> «Настройки» → «Очистить всё» удаляет данные безвозвратно.</p></div>',
    '<button class="btn btn-primary" type="button" data-modal-close>Закрыть</button>',{size:'modal-lg'});}
function showShortcuts(){
  Modal.show('Горячие клавиши',
    [['Ctrl / Cmd + K','Палитра команд и поиск'],['N','Новая песня'],['E','Новое событие'],['S','Новый сет-лист'],
     ['G, затем C / S / B','Главная / Песни / Сет-листы'],['Ctrl / Cmd + S','Сохранить в редакторе'],['Esc','Закрыть окно, фильтр или выйти со сцены'],
     ['← →','Сцена: песни · Календарь: навигация'],['Пробел','Сцена: автопрокрутка'],['+ / −','Сцена: размер шрифта'],['?','Эта справка']]
      .map(r=>hotkeyRow(r[0],r[1])).join(''),
    '<button class="btn btn-primary" type="button" data-modal-close>Понятно</button>');}
async function logoutProfile(){
  Modal.confirm('Выйти из профиля?','Имя профиля на этом устройстве будет удалено. Песни, события, сет-листы и группы останутся на месте.',async()=>{
    State.profile=Object.assign({},DEFAULT_PROFILE);writePrefs({profile:State.profile});
    await dbPut('meta',{id:'profile',value:State.profile});renderMore();},'Выйти');}

/* ═══ SECTION 6/8: COMMAND PALETTE & SEARCH ═══ */
let cmdResults=[],cmdIdx=0;
function baseCommands(){return[
  {label:'Новое событие',icon:'📅',keys:'E',run:()=>openEventEditor()},
  {label:'Новая песня',icon:'🎵',keys:'N',run:()=>openSongEditor()},
  {label:'Новый сет-лист',icon:'📋',keys:'S',run:()=>openSetlistEditor()},
  {label:'Новая группа',icon:'👥',run:()=>openGroupEditor()},
  {label:'Новый участник',icon:'🎤',run:()=>openMemberEditor()},
  {label:'Перейти: Главная (календарь)',icon:'🗓️',run:()=>navigate('#/calendar')},
  {label:'Перейти: Песни',icon:'🎼',run:()=>navigate('#/songs')},
  {label:'Перейти: Сет-листы и группы',icon:'📑',run:()=>navigate('#/band')},
  {label:'Перейти: Сцена',icon:'🎬',run:()=>navigate('#/scene')},
  {label:'Перейти: Настройки',icon:'⚙️',run:()=>navigate('#/more')},
  {label:'К сегодняшнему дню',icon:'📍',run:()=>{State.ui.calendarDate=new Date();navigate('#/calendar');}},
  {label:'Сменить тему',icon:'🎨',keys:'T',run:()=>toggleTheme()},
  {label:'Управление ролями',icon:'🎭',run:()=>manageRoles()},
  {label:'Печать и PDF…',icon:'🖨️',run:()=>{State.ui.selectMode=true;State.ui.selection.clear();navigate('#/songs');setTimeout(renderSelectionBar,120);}},
  {label:'Экспорт данных…',icon:'📤',run:()=>exportChooser()},
  {label:'Импорт данных из JSON…',icon:'📥',run:()=>triggerImport()},
  {label:'Создать резервную копию',icon:'🗂️',run:()=>exportAll()},
  {label:'Установить приложение',icon:'📲',run:()=>installApp()},
  {label:'Помощь и сценарии работы',icon:'❓',run:showHelp},
  {label:'Политика конфиденциальности',icon:'🔒',run:showPrivacy},
  {label:'Горячие клавиши',icon:'⌨️',keys:'?',run:showShortcuts}];}
function triggerImport(){if(State.ui.base!=='/more'){navigate('#/more');setTimeout(()=>{const x=$('#importFile');if(x)x.click();},320);return;}
  const i=$('#importFile');if(i)i.click();}
function openCmdPalette(){$('#cmdPaletteOverlay').classList.add('active');
  const inp=$('#cmdInput');inp.value='';renderCmdResults('');setTimeout(()=>inp.focus(),40);}
function closeCmdPalette(){$('#cmdPaletteOverlay').classList.remove('active');const i=$('#cmdInput');if(i)i.value='';}
function scoreMatch(label,q){const l=label.toLowerCase();
  if(l===q)return 100;if(l.indexOf(q)===0)return 80;if(l.indexOf(q)>0)return 60;
  let i=0,hits=0;for(let j=0;j<l.length;j++)if(l[j]===q[i]){i++;hits++;if(i===q.length)break;}
  return i===q.length?30+hits:0;}
function renderCmdResults(query){
  const q=String(query||'').toLowerCase().trim();
  let list=baseCommands().filter(c=>!q||scoreMatch(c.label,q)>0);
  if(q)list.sort((a,b)=>scoreMatch(b.label,q)-scoreMatch(a.label,q));
  const groups=[{title:'Команды',items:list.slice(0,12)}];
  if(q){const push=(title,items)=>{if(items.length)groups.push({title,items});};
    push('Песни',State.songs.filter(s=>(s.title||'').toLowerCase().indexOf(q)>=0||(s.artist||'').toLowerCase().indexOf(q)>=0||(s.author||'').toLowerCase().indexOf(q)>=0)
      .slice(0,6).map(s=>({label:s.title,icon:'🎵',meta:[s.key,s.artist||s.author].filter(Boolean).join(' · '),run:()=>navigate('#/songs/'+s.id)})));
    push('События',State.events.filter(e=>(e.title||'').toLowerCase().indexOf(q)>=0||(e.location||'').toLowerCase().indexOf(q)>=0)
      .slice(0,6).map(e=>({label:e.title,icon:'📅',meta:formatDateShort(e.start)+' '+formatTime(e.start),run:()=>openEventDetails(e.id)})));
    push('Сет-листы',State.setlists.filter(s=>s.name.toLowerCase().indexOf(q)>=0)
      .slice(0,5).map(s=>({label:s.name,icon:'📋',meta:(s.items||[]).length+' песен',run:()=>navigate('#/band/setlist/'+s.id)})));
    push('Группы',State.groups.filter(g=>g.name.toLowerCase().indexOf(q)>=0)
      .slice(0,4).map(g=>({label:g.name,icon:'👥',meta:'Группа',run:()=>navigate('#/band/group/'+g.id)})));
    push('Участники',State.members.filter(m=>m.name.toLowerCase().indexOf(q)>=0||(m.roles||[]).some(r=>r.toLowerCase().indexOf(q)>=0))
      .slice(0,5).map(m=>({label:m.name,icon:'👤',meta:(m.roles||[]).join(', '),run:()=>openMemberEditor({id:m.id})})));}
  cmdResults=[];let html='';
  groups.forEach(g=>{if(!g.items.length)return;
    html+='<div class="cmd-group-title">'+escapeHtml(g.title)+'</div>';
    g.items.forEach(c=>{const i=cmdResults.length;cmdResults.push(c);
      html+='<div class="cmd-item'+(i===0?' selected':'')+'" role="option" data-cmd="'+i+'" tabindex="-1"><span class="cmd-item-icon">'+c.icon+'</span>'+
        '<span class="cmd-item-label">'+escapeHtml(c.label)+(c.meta?' <span class="text-muted" style="font-size:12px">· '+escapeHtml(c.meta)+'</span>':'')+'</span>'+
        (c.keys?'<span class="cmd-item-shortcut">'+escapeHtml(c.keys)+'</span>':'')+'</div>';});});
  if(!cmdResults.length)html='<p class="text-muted text-center" style="padding:24px">Ничего не найдено</p>';
  $('#cmdResults').innerHTML=html;cmdIdx=0;
  $$('#cmdResults .cmd-item').forEach(it=>{const i=parseInt(it.getAttribute('data-cmd'),10);
    it.addEventListener('click',()=>runCmd(i));
    it.addEventListener('mouseenter',()=>{cmdIdx=i;highlightCmd();});});}
function highlightCmd(){$$('#cmdResults .cmd-item').forEach((it,i)=>it.classList.toggle('selected',i===cmdIdx));
  const s=$('#cmdResults .cmd-item.selected');if(s&&s.scrollIntoView)s.scrollIntoView({block:'nearest'});}
function runCmd(i){const c=cmdResults[i];if(!c)return;closeCmdPalette();
  setTimeout(()=>{try{c.run();}catch(e){Logger.error('cmd',e);Toast.error('Не удалось выполнить команду');}},30);}
let _searchCache={q:null,html:null,actions:[]};
function closeSearchDropdown(){const d=$('#searchDropdown');if(d)d.classList.remove('active');}
function handleGlobalSearch(query){
  const dd=$('#searchDropdown'),q=String(query||'').toLowerCase().trim();
  if(!dd)return;
  if(q.length<2){closeSearchDropdown();return;}
  if(_searchCache.q===q&&_searchCache.html){dd.innerHTML=_searchCache.html;bindSearchResults(_searchCache.actions,dd);dd.classList.add('active');return;}
  const sections=[],add=(title,items)=>{if(items.length)sections.push({title,items});};
  add('Песни',State.songs.filter(s=>(s.title||'').toLowerCase().indexOf(q)>=0||(s.artist||'').toLowerCase().indexOf(q)>=0||(s.author||'').toLowerCase().indexOf(q)>=0||(s.tags||[]).some(t=>String(t).toLowerCase().indexOf(q)>=0)).slice(0,5)
    .map(s=>({icon:'🎵',title:s.title,meta:[s.key,s.artist||s.author].filter(Boolean).join(' · '),run:()=>navigate('#/songs/'+s.id)})));
  add('События',State.events.filter(e=>(e.title||'').toLowerCase().indexOf(q)>=0||(e.location||'').toLowerCase().indexOf(q)>=0).slice(0,5)
    .map(e=>({icon:'📅',title:e.title,meta:formatDateShort(e.start)+' · '+formatTime(e.start),run:()=>openEventDetails(e.id)})));
  add('Сет-листы',State.setlists.filter(s=>s.name.toLowerCase().indexOf(q)>=0).slice(0,4)
    .map(s=>({icon:'📋',title:s.name,meta:(s.items||[]).length+' песен',run:()=>navigate('#/band/setlist/'+s.id)})));
  add('Группы',State.groups.filter(g=>g.name.toLowerCase().indexOf(q)>=0).slice(0,3)
    .map(g=>({icon:'👥',title:g.name,meta:'Группа',run:()=>navigate('#/band/group/'+g.id)})));
  add('Участники',State.members.filter(m=>m.name.toLowerCase().indexOf(q)>=0||(m.roles||[]).some(r=>r.toLowerCase().indexOf(q)>=0)).slice(0,4)
    .map(m=>({icon:'👤',title:m.name,meta:(m.roles||[]).join(', ')||'—',run:()=>openMemberEditor({id:m.id})})));
  if(!sections.length){dd.innerHTML='<p class="text-muted text-center" style="padding:24px">Ничего не найдено по запросу «'+escapeHtml(q)+'»</p>';
    dd.classList.add('active');_searchCache={q,html:dd.innerHTML,actions:[]};return;}
  let html='';const flat=[];
  sections.forEach(sec=>{html+='<div class="search-section-title">'+escapeHtml(sec.title)+'</div>';
    sec.items.forEach(it=>{const i=flat.length;flat.push(it);
      html+='<div class="search-result-item" role="option" data-sr="'+i+'" tabindex="0"><span class="search-result-icon">'+it.icon+'</span>'+
        '<div style="min-width:0"><div class="search-result-title">'+escapeHtml(it.title)+'</div><div class="search-result-meta">'+escapeHtml(it.meta||'')+'</div></div></div>';});});
  _searchCache={q,html,actions:flat};
  dd.innerHTML=html;bindSearchResults(flat,dd);dd.classList.add('active');}
function bindSearchResults(flat,dd){
  $$('[data-sr]',dd).forEach(el=>{const go=()=>{const it=flat[parseInt(el.getAttribute('data-sr'),10)];
      closeSearchDropdown();const inp=$('#globalSearch');if(inp)inp.value='';
      _searchCache={q:null,html:null,actions:[]};if(it)it.run();};
    el.addEventListener('click',go);
    el.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();go();}});});}

/* ═══ PWA ═══ */
function makeIconPNG(size,maskable){
  try{const c=document.createElement('canvas');c.width=size;c.height=size;
    const ctx=c.getContext('2d');if(!ctx)return null;
    const pad=maskable?size*0.1:0,s=size-pad*2,r=maskable?0:s*0.22;
    ctx.save();ctx.translate(pad,pad);ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(0,0,s,s,r);
    else{ctx.moveTo(r,0);ctx.lineTo(s-r,0);ctx.quadraticCurveTo(s,0,s,r);ctx.lineTo(s,s-r);ctx.quadraticCurveTo(s,s,s-r,s);ctx.lineTo(r,s);ctx.quadraticCurveTo(0,s,0,s-r);ctx.lineTo(0,r);ctx.quadraticCurveTo(0,0,r,0);ctx.closePath();}
    const g=ctx.createLinearGradient(0,0,s,s);
    g.addColorStop(0,shadeColor(State.settings.accent,0.22));g.addColorStop(1,shadeColor(State.settings.accent,-0.16));
    ctx.fillStyle=g;ctx.fill();
    const u=s/64;
    ctx.strokeStyle='#fff';ctx.lineWidth=4*u;ctx.lineJoin='round';ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(26*u,44*u);ctx.lineTo(26*u,20*u);ctx.lineTo(44*u,17*u);ctx.lineTo(44*u,41*u);ctx.stroke();
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(21*u,44*u,5*u,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(39*u,41*u,5*u,0,Math.PI*2);ctx.fill();
    ctx.restore();
    return c.toDataURL('image/png');}catch(e){Logger.warn('icon',e);return null;}}
function buildManifest(){
  const fb="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='112' fill='%236366f1'/%3E%3Cpath d='M208 352V160l144-24v192' stroke='white' stroke-width='32' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='168' cy='352' r='40' fill='white'/%3E%3Ccircle cx='312' cy='328' r='40' fill='white'/%3E%3C/svg%3E";
  const i192=makeIconPNG(192,false)||fb,i512=makeIconPNG(512,false)||fb,iMask=makeIconPNG(512,true)||fb;
  const i180=makeIconPNG(180,false);if(i180){const a=$('#appleTouchIcon');if(a)a.href=i180;}
  const i64=makeIconPNG(64,false);if(i64){const f=$('#appIcon');if(f)f.href=i64;}
  const manifest={name:'BandPlan — Music Group OS',short_name:'BandPlan',
    description:'Календарь, песни с аккордами и динамикой по инструментам, сет-листы, группы и участники музыкального коллектива. Работает офлайн.',
    id:'./',start_url:'./',scope:'./',display:'standalone',display_override:['standalone','minimal-ui'],
    orientation:'any',background_color:'#e8eaf6',theme_color:State.settings.accent,lang:'ru',dir:'ltr',
    categories:['music','productivity','utilities'],
    icons:[{src:i192,sizes:'192x192',type:'image/png',purpose:'any'},{src:i512,sizes:'512x512',type:'image/png',purpose:'any'},{src:iMask,sizes:'512x512',type:'image/png',purpose:'maskable'}],
    shortcuts:[{name:'Главная',url:'./#/calendar'},{name:'Песни',url:'./#/songs'},{name:'Сет-листы',url:'./#/band'},{name:'Сцена',url:'./#/scene'}]};
  try{const link=$('#appManifest');if(link)link.href=URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'}));}
  catch(e){Logger.warn('manifest',e);}}
let deferredPrompt=null;
function isStandalone(){return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;}
function isIOS(){const ua=navigator.userAgent||'';return /iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
function detectPlatformHint(){
  if(isIOS())return 'iOS: «Поделиться» → «На экран Домой»';
  if(/Android/i.test(navigator.userAgent||''))return 'Android: меню браузера → «Установить приложение»';
  return 'Установка через меню браузера';}
function showInstallBanner(){const b=$('#installBanner');
  if(!b||isStandalone()||State.settings.installDismissed)return;
  b.hidden=false;b.classList.add('active');}
function hideInstallBanner(){const b=$('#installBanner');if(b){b.classList.remove('active');b.hidden=true;}}
function setupInstallPrompt(){
  window.addEventListener('beforeinstallprompt',ev=>{
    ev.preventDefault();deferredPrompt=ev;
    const b=$('#installBtn');if(b)b.hidden=false;
    const s=$('#installSideBtn');if(s)s.hidden=false;
    const st=$('#installStatus');if(st)st.textContent='Готово к установке';
    showInstallBanner();});
  window.addEventListener('appinstalled',()=>{
    deferredPrompt=null;
    const b=$('#installBtn');if(b)b.hidden=true;
    const s=$('#installSideBtn');if(s)s.hidden=true;
    hideInstallBanner();
    const st=$('#installStatus');if(st)st.textContent='Установлено';});
  if(isStandalone())hideInstallBanner();
  else if(isIOS())setTimeout(showInstallBanner,1400);}
function installApp(){
  hideInstallBanner();
  if(deferredPrompt){
    try{deferredPrompt.prompt();
      deferredPrompt.userChoice.then(()=>{deferredPrompt=null;const b=$('#installBtn');if(b)b.hidden=true;
        const st=$('#installStatus');if(st)st.textContent=detectPlatformHint();}).catch(()=>{deferredPrompt=null;showInstallHelp();});}
    catch(e){deferredPrompt=null;showInstallHelp();}
    return;}
  showInstallHelp();}
function showInstallHelp(){
  Modal.show('Установка BandPlan',
    '<p style="font-size:14px;line-height:1.7;color:var(--text-muted)">Приложение устанавливается средствами браузера. Выберите вашу платформу:</p>'+
    '<div class="preview-box"><strong>📱 Android / Chrome</strong><br>Меню ⋮ → «Установить приложение» или «Добавить на главный экран».<br><br>'+
    '<strong>🍏 iPhone / iPad · Safari</strong><br>«Поделиться» → «На экран Домой» → «Добавить».<br><br>'+
    '<strong>💻 Windows / macOS / Linux · Chrome, Edge</strong><br>Значок установки в адресной строке или меню → «Установить BandPlan».<br><br>'+
    '<strong>ℹ️ Важно</strong><br>Для автоматической установки страница должна открываться по https:// или localhost. Все данные хранятся локально и доступны офлайн.</div>',
    '<button class="btn" type="button" data-modal-close>Закрыть</button><button class="btn btn-primary" type="button" id="installRetry">Попробовать снова</button>',
    {onMount(){const b=$('#installRetry');if(b)b.addEventListener('click',()=>{Modal.close();installApp();});}});}

/* ═══ DRAG HELPER ═══ */
function makeDraggable(el,opts){
  let sx=0,sy=0,dragging=false;
  el.addEventListener('pointerdown',ev=>{
    if(ev.pointerType==='mouse'&&ev.button!==0)return;
    if(Modal.isOpen()||$('#cmdPaletteOverlay').classList.contains('active'))return;
    sx=ev.clientX;sy=ev.clientY;dragging=false;
    const pid=ev.pointerId;
    try{el.setPointerCapture(pid);}catch(e){}
    const move=e2=>{const dx=e2.clientX-sx,dy=e2.clientY-sy;
      if(!dragging&&Math.sqrt(dx*dx+dy*dy)<6)return;
      if(!dragging){dragging=true;if(opts.onStart)opts.onStart(e2,dx,dy);}
      if(e2.cancelable)e2.preventDefault();
      if(opts.onMove)opts.onMove(e2,dx,dy);};
    const cleanup=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',cancel);
      try{el.releasePointerCapture(pid);}catch(e){}};
    const up=e3=>{cleanup();if(dragging){if(opts.onEnd)opts.onEnd(e3);}else if(opts.onTap)opts.onTap(e3);dragging=false;};
    const cancel=e4=>{cleanup();if(dragging&&opts.onEnd)opts.onEnd(e4);dragging=false;};
    el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',cancel);});}

/* ═══ SECTION 16: DEMO DATA ═══ */
async function seedDemoData(){
  const g1={id:uid('grp'),name:'Worship Team',description:'Прославление на воскресных служениях и молодёжных вечерах',leader:'Алексей Иванов',color:'#6366f1',inviteCode:'WT2026',status:'active',notes:'Репетиции по вторникам, звук проверяем за час до служения.',logoFileId:null,createdAt:nowISO(),updatedAt:nowISO()};
  const g2={id:uid('grp'),name:'Rock Band',description:'Концертный состав для городских площадок',leader:'Мария Петрова',color:'#ef4444',inviteCode:'RB2026',status:'active',notes:'',logoFileId:null,createdAt:nowISO(),updatedAt:nowISO()};
  await saveGroup(g1);await saveGroup(g2);
  const mDefs=[
    {name:'Алексей Иванов',roles:['Vocal','Guitar'],color:'#6366f1',contacts:{phone:'+7 900 111-22-33',email:'alex@bandplan.app',telegram:'@alexey_iv',whatsapp:'+79001112233'}},
    {name:'Мария Петрова',roles:['Keys','Vocal'],color:'#ec4899',contacts:{phone:'+7 900 222-33-44',email:'maria@bandplan.app',telegram:'@maria_p',whatsapp:''}},
    {name:'Дмитрий Сидоров',roles:['Bass'],color:'#22c55e',contacts:{phone:'+7 900 333-44-55',email:'',telegram:'@dmitry_bass',whatsapp:'+79003334455'}},
    {name:'Елена Смирнова',roles:['Vocal'],color:'#f59e0b',contacts:{phone:'',email:'elena@bandplan.app',telegram:'',whatsapp:''}},
    {name:'Сергей Кузнецов',roles:['Drums'],color:'#8b5cf6',contacts:{phone:'+7 900 555-66-77',email:'',telegram:'@serg_drums',whatsapp:''}}];
  const members=[];
  for(const d of mDefs)members.push(await saveMember({id:uid('mem'),name:d.name,roles:d.roles,avatar:d.name[0],color:d.color,status:'active',groupIds:[g1.id,g2.id],contacts:d.contacts,note:'',createdAt:nowISO(),updatedAt:nowISO()}));
  const sDefs=[
    {title:'Amazing Grace',artist:'Chris Tomlin',author:'John Newton',key:'G',bpm:72,timeSignature:'4/4',duration:240,genre:'Worship',language:'English',tags:['classic','hymn'],favorite:true,
     lyrics:'[Verse 1]\nG          G7       C        G\nAmazing grace how sweet the sound\nG          G7     D        G\nThat saved a wretch like me\nG          G7       C        G\nI once was lost but now am found\nG          D7       C    G\nWas blind but now I see\n\n[Chorus]\nC          G          D\nMy chains are gone I\'ve been set free\nC          G          D\nMy God my Savior has ransomed me\nC          G          D    Em\nAnd like a flood His mercy reigns\nC          D          G\nUnending love amazing grace',
     dyn:[['Vocal',0,{'Verse 1':'mp','Chorus':'ff'}],['Guitar',0,{'Verse 1':'p','Chorus':'f'}],['Keys',1,{'Verse 1':'mp','Chorus':'mf'}],['Bass',2,{'Verse 1':'off','Chorus':'mf'}],['Drums',4,{'Verse 1':'off','Chorus':'f'}]]},
    {title:'10,000 Reasons',artist:'Matt Redman',author:'Matt Redman',key:'D',bpm:78,timeSignature:'4/4',duration:280,genre:'Worship',language:'English',tags:['modern'],favorite:true,
     lyrics:'[Verse 1]\nD        A        Bm    G\nBless the Lord O my soul\nD          A             G\nO my soul worship His holy name\nD         A        Bm    G\nSing like never before\nD        A           G\nO my soul I\'ll worship Your holy name\n\n[Chorus]\nG       D             A\nBless the Lord O my soul\nBm        A           G\nAnd all that is within me\nG          D         A\nBless His holy name',
     dyn:[['Vocal',0,{'Verse 1':'mf','Chorus':'f'}],['Guitar',0,{'Verse 1':'mp','Chorus':'mf'}],['Drums',4,{'Verse 1':'p','Chorus':'f'}]]},
    {title:'Way Maker',artist:'Sinach',author:'Osinachi Kalu',key:'A',bpm:70,timeSignature:'4/4',duration:320,genre:'Worship',language:'English',tags:['modern'],favorite:false,
     lyrics:'[Verse 1]\nA          E         Bm      D\nYou are here moving in our midst\nA          E         D\nI worship You I worship You\nA          E         Bm      D\nYou are here working in this place\nA          E         D\nI worship You I worship You\n\n[Chorus]\nD        A          E\nWay Maker miracle worker\nF#m        D\nPromise keeper light in the darkness\nA          E\nMy God that is who You are',dyn:[]},
    {title:'Океаны',artist:'Worship RU',author:'Перевод Hillsong',key:'Dm',bpm:68,timeSignature:'4/4',duration:340,genre:'Worship',language:'Русский',tags:['modern','ru'],favorite:true,
     lyrics:'[Verse 1]\nDm         Bb         F\nТы зовёшь меня на воды\nC          Dm\nГде ноги могут подвести\nDm         Bb         F\nИ там Тебя я встречу в тайне\nC\nВ глубинах вера будет жить\n\n[Chorus]\nBb         F          C\nВеди меня туда где вера без границ\nDm         C          Bb\nГде Ты позовёшь меня\nBb         F          C\nЯ пойду по водам куда Ты позовёшь',dyn:[]}];
  for(const sd of sDefs){
    const secs=parseSections(sd.lyrics);
    let dyn=null;
    if(sd.dyn&&sd.dyn.length){dyn={sections:secs.slice(),rows:sd.dyn.map(d=>{const levels={};
      secs.forEach(sec=>{levels[sec]=(d[2]&&d[2][sec])||'off';});
      return{id:uid('dyn'),instrument:d[0],memberId:(members[d[1]]||{}).id||null,levels};})};}
    await saveSong({id:uid('song'),artist:sd.artist,author:sd.author,title:sd.title,key:sd.key,bpm:sd.bpm,timeSignature:sd.timeSignature,
      duration:sd.duration,genre:sd.genre,language:sd.language,tags:sd.tags,favorite:sd.favorite,lyrics:sd.lyrics,dynamics:dyn,
      notes:'',link:'',groupIds:[g1.id],fileIds:[],version:1,createdAt:nowISO(),updatedAt:nowISO()});}
  const sl1={id:uid('set'),name:'Sunday Worship Set',groupId:g1.id,status:'active',notes:'Вступление — инструментал 1 мин; между 2 и 3 песней переход без паузы.',items:[],createdAt:nowISO(),updatedAt:nowISO()};
  const sl2={id:uid('set'),name:'Concert Set 2026',groupId:g2.id,status:'draft',notes:'Концертная программа, финал — общий акцент.',items:[],createdAt:nowISO(),updatedAt:nowISO()};
  await saveSetlist(sl1);await saveSetlist(sl2);
  sl1.items=State.songs.slice(0,3).map((s,i)=>({id:uid('si'),songId:s.id,position:i,keyOverride:i===2?'C':null,bpmOverride:null,notes:i===0?'Начинаем тихо':'',transition:i===1?'Без паузы в следующую':'',leadMemberId:i%2===0?members[0].id:members[1].id}));
  sl2.items=State.songs.slice(1,4).map((s,i)=>({id:uid('si'),songId:s.id,position:i,keyOverride:null,bpmOverride:null,notes:'',transition:'',leadMemberId:members[3].id}));
  await saveSetlist(sl1);await saveSetlist(sl2);
  const today=startOfDay(new Date());
  const mk=(off,h,m)=>{const d=new Date(today);d.setDate(d.getDate()+off);d.setHours(h,m,0,0);return d;};
  const eDefs=[
    {title:'Воскресное служение',type:'worship',start:mk((7-today.getDay())%7||7,10,0),dur:7200000,location:'Главный зал',groupId:g1.id,description:'Служение прославления',status:'confirmed',setlistId:sl1.id,parts:members.slice(0,4).map((m,i)=>({memberId:m.id,status:i===3?'pending':'confirmed'})),offs:[1440,60,15],repeat:'weekly',myStatus:'yes'},
    {title:'Репетиция Worship Team',type:'rehearsal',start:mk(2,18,30),dur:9000000,location:'Репетиционная база',groupId:g1.id,description:'Разбор новых песен и динамики',status:'confirmed',setlistId:sl1.id,parts:members.map(m=>({memberId:m.id,status:'confirmed'})),offs:[180],repeat:'weekly',myStatus:'yes'},
    {title:'Концерт «Голоса»',type:'concert',start:mk(9,19,0),dur:10800000,location:'ДК Культуры, ул. Ленина 12',groupId:g2.id,description:'Благотворительный концерт',status:'pending',setlistId:sl2.id,parts:members.map((m,i)=>({memberId:m.id,status:i%3===0?'pending':'confirmed'})),offs:[10080,1440,60],repeat:'none',myStatus:'maybe'},
    {title:'Планирование программы',type:'meeting',start:mk(4,14,0),dur:5400000,location:'Офис',groupId:g1.id,description:'План на следующий месяц',status:'pending',setlistId:null,parts:[{memberId:members[0].id,status:'confirmed'},{memberId:members[1].id,status:'pending'}],offs:[1440],repeat:'none',myStatus:'yes'},
    {title:'Замена струн и настройка',type:'personal',start:mk(1,12,0),dur:3600000,location:'Дом',groupId:null,description:'Личное напоминание перед репетицией',status:'confirmed',setlistId:null,parts:[],offs:[30],repeat:'none',myStatus:'yes'}];
  for(const d of eDefs){const end=new Date(d.start.getTime()+d.dur);
    await saveEvent({id:uid('evt'),title:d.title,type:d.type,start:d.start.toISOString(),end:end.toISOString(),
      timezone:(Intl.DateTimeFormat().resolvedOptions().timeZone)||'',location:d.location,groupId:d.groupId,description:d.description,
      status:d.status,color:TYPE_COLORS[d.type],setlistId:d.setlistId,participants:d.parts,participantIds:d.parts.map(p=>p.memberId),
      reminderOffsets:d.offs,repeat:d.repeat,repeatUntil:null,repeatInterval:1,exdates:[],myStatus:d.myStatus,fileIds:[],createdAt:nowISO(),updatedAt:nowISO()});}
  rebuildIndex();await refreshAllReminders();await logActivity('system','Загружены демонстрационные данные');}
function resetDemoData(){
  Modal.confirm('Загрузить демо-данные?','Текущие песни, события, сет-листы, группы и участники будут удалены и заменены демонстрационными. Рекомендуем сначала создать резервную копию.',async()=>{
    for(const st of ['songs','events','setlists','groups','members','songVersions','reminders','activity'])await dbClear(st);
    State.songs=[];State.events=[];State.setlists=[];State.groups=[];State.members=[];
    State.songVersions=[];State.reminders=[];State.activity=[];
    await seedDemoData();handleRoute();},'Загрузить',true);}
function clearAllData(){
  Modal.confirm('Очистить все данные?','Будут удалены все песни, события, сет-листы, группы, участники, версии и история. Действие необратимо — сначала создайте резервную копию.',async()=>{
    for(const st of STORES)if(st!=='meta')await dbClear(st);
    State.songs=[];State.events=[];State.setlists=[];State.groups=[];State.members=[];
    State.songVersions=[];State.reminders=[];State.activity=[];State.syncQueue=[];State.fileMeta=[];
    rebuildIndex();handleRoute();},'Очистить всё',true);}

/* ═══ ONBOARDING ═══ */
function startOnboarding(){
  const steps=['profile','group','theme','demo'],step={i:0};
  const render=()=>{
    const cur=steps[step.i];let title='Добро пожаловать в BandPlan',body='',footer='';
    if(cur==='profile'){
      title='Шаг 1 из 4 — Вы';
      body='<p style="font-size:14px;color:var(--text-muted);line-height:1.6">BandPlan хранит всё на устройстве и работает без интернета. На мобильном устанавливается как приложение, вкладки переключаются свайпом.</p>'+
        '<div class="form-group"><label class="form-label" for="obName">Ваше имя</label><input class="form-input" id="obName" type="text" maxlength="60" placeholder="Например: Алексей"></div>'+
        '<div class="form-group"><label class="form-label" for="obRole">Ваша роль</label><input class="form-input" id="obRole" type="text" maxlength="60" placeholder="Например: Keyboard"></div>';
      footer='<button class="btn" type="button" id="obSkip">Пропустить</button><button class="btn btn-primary" type="button" id="obNext">Дальше</button>';
    }else if(cur==='group'){
      title='Шаг 2 из 4 — Ваш коллектив';
      body='<div class="form-group"><label class="form-label" for="obGroup">Название группы</label><input class="form-input" id="obGroup" type="text" maxlength="60" placeholder="Например: Worship Team"></div>'+
        '<div class="form-group"><label class="form-label" for="obColor">Цвет группы в календаре</label><input class="form-input" id="obColor" type="color" style="height:48px;padding:6px" value="'+escapeHtml(State.settings.accent)+'"></div>';
      footer='<button class="btn" type="button" id="obBack">Назад</button><button class="btn" type="button" id="obSkip">Пропустить</button><button class="btn btn-primary" type="button" id="obNext">Дальше</button>';
    }else if(cur==='theme'){
      title='Шаг 3 из 4 — Оформление';
      body='<p style="font-size:14px;color:var(--text-muted);margin-bottom:12px">Тему, акцентный цвет и размеры шрифтов можно изменить в настройках.</p>'+
        '<div class="flex gap-2 flex-wrap">'+Object.keys(THEME_NAMES).concat(['system']).map(k=>
          '<button class="btn'+((State.settings.systemTheme?'system':State.settings.theme)===k?' btn-primary':'')+'" type="button" data-ob-theme="'+k+'">'+(THEME_NAMES[k]||'Системная')+'</button>').join('')+'</div>'+
        '<div class="chip-row mt-4" id="obAccents">'+ACCENTS.map(a=>'<button class="accent-swatch'+(State.settings.accent===a?' on':'')+'" type="button" data-ob-accent="'+a+'" style="background:'+a+'" aria-label="Акцент '+a+'"></button>').join('')+'</div>';
      footer='<button class="btn" type="button" id="obBack">Назад</button><button class="btn btn-primary" type="button" id="obNext">Дальше</button>';
    }else{
      title='Шаг 4 из 4 — Данные';
      body='<p style="font-size:14px;color:var(--text-muted);line-height:1.6;margin-bottom:12px">Загрузить демонстрационные данные? 4 песни с аккордами и динамикой, 2 группы, 5 участников с контактами, 5 событий (включая еженедельную репетицию) и 2 сет-листа. Демо можно удалить в настройках.</p>'+
        '<div class="flex gap-2 flex-wrap"><button class="btn btn-primary" type="button" id="obDemoYes">🎵 Загрузить демо-данные</button>'+
        '<button class="btn" type="button" id="obDemoNo">Начать с чистого листа</button></div>';
      footer='<button class="btn" type="button" id="obBack">Назад</button>';}
    Modal.show(title,body,footer,{onMount(){
      const next=$('#obNext'),back=$('#obBack'),skip=$('#obSkip');
      if(next)next.addEventListener('click',async()=>{
        if(steps[step.i]==='profile'){State.profile.name=($('#obName').value||'').trim();State.profile.role=($('#obRole').value||'').trim();
          writePrefs({profile:State.profile});await dbPut('meta',{id:'profile',value:State.profile});}
        if(steps[step.i]==='group'){const n=($('#obGroup').value||'').trim();
          if(n&&!State.groups.length)await saveGroup({id:uid('grp'),name:n,description:'',leader:State.profile.name||'',color:$('#obColor').value||State.settings.accent,
            inviteCode:n.slice(0,3).toUpperCase()+new Date().getFullYear(),status:'active',notes:'',logoFileId:null,createdAt:nowISO(),updatedAt:nowISO()});
          if(State.profile.name&&!State.members.length&&State.groups.length)await saveMember({id:uid('mem'),name:State.profile.name,roles:State.profile.role?[State.profile.role]:[],
            avatar:State.profile.name[0].toUpperCase(),color:State.groups[0].color,status:'active',groupIds:[State.groups[0].id],
            contacts:{phone:'',email:'',telegram:'',whatsapp:''},note:'',createdAt:nowISO(),updatedAt:nowISO()});}
        step.i++;render();});
      if(back)back.addEventListener('click',()=>{step.i=Math.max(0,step.i-1);render();});
      if(skip)skip.addEventListener('click',()=>complete(false));
      $$('[data-ob-theme]').forEach(b=>b.addEventListener('click',()=>{applyTheme(b.getAttribute('data-ob-theme'));
        $$('[data-ob-theme]').forEach(x=>x.classList.toggle('btn-primary',x===b));}));
      $$('[data-ob-accent]').forEach(b=>b.addEventListener('click',()=>{applyAccent(b.getAttribute('data-ob-accent'));
        $$('[data-ob-accent]').forEach(x=>x.classList.toggle('on',x===b));buildManifest();}));
      const dy=$('#obDemoYes'),dn=$('#obDemoNo');
      if(dy)dy.addEventListener('click',()=>complete(true));
      if(dn)dn.addEventListener('click',()=>complete(false));}});};
  async function complete(withDemo){State.settings.onboardingDone=true;writePrefs({onboardingDone:true});Modal.close();
    if(withDemo)await seedDemoData();
    handleRoute();}
  render();}

/* ═══ SECTION 17: WIRING & INIT ═══ */
const ACTIONS={
  'toggle-filter':el=>toggleFilterDropdown(el.getAttribute('data-target'),el),
  'close-filter':el=>{const dd=document.getElementById(el.getAttribute('data-target'));if(dd)dd.classList.remove('open');
    const m=dd&&dd.closest('.filter-menu');if(m)m.classList.remove('open');},
  'reset-cal-filters':()=>{State.ui.filters.groupId='';State.ui.filters.types=[];State.ui.filters.query='';State.ui.filters.onlyMine=false;renderCalendar();},
  'reset-song-filters':()=>{State.ui.songs={filter:'all',sort:'updated',query:'',group:'',genre:'',key:'',language:''};renderSongs();},
  'new-event':()=>openEventEditor(),
  'new-event-day':el=>createEventAt(el.getAttribute('data-day'),18*60),
  'new-event-group':el=>openEventEditor({groupId:el.getAttribute('data-id')}),
  'new-song':()=>openSongEditor(),
  'new-setlist':()=>openSetlistEditor(),
  'new-setlist-group':el=>openSetlistEditor({groupId:el.getAttribute('data-id')}),
  'new-group':()=>openGroupEditor(),
  'new-member':()=>openMemberEditor(),
  'edit-event':el=>openEventEditor({id:el.getAttribute('data-id')}),
  'edit-song':el=>openSongEditor({id:el.getAttribute('data-id')}),
  'edit-setlist':el=>openSetlistEditor({id:el.getAttribute('data-id')}),
  'edit-group':el=>openGroupEditor({id:el.getAttribute('data-id')}),
  'event-details':el=>openEventDetails(el.getAttribute('data-id'),el.getAttribute('data-occ')),
  'delete-event':el=>confirmDeleteEvent(el.getAttribute('data-id')),
  'duplicate-event':el=>duplicateEvent(el.getAttribute('data-id')),
  'my-status':el=>setMyStatus(el.getAttribute('data-id'),el.getAttribute('data-val')),
  'recur-edit-one':el=>editOneOccurrence(el.getAttribute('data-id'),el.getAttribute('data-occ')),
  'recur-cancel-one':el=>cancelOneOccurrence(el.getAttribute('data-id'),el.getAttribute('data-occ')),
  'cal-nav':el=>calendarNav(parseInt(el.getAttribute('data-dir'),10)),
  'cal-view':el=>setCalendarView(el.getAttribute('data-val')),
  'cal-today':()=>goToToday(),
  'cal-week-of-day':el=>{State.ui.calendarDate=new Date(el.getAttribute('data-day')+'T12:00:00');setCalendarView('week');},
  'delete-song':el=>confirmDeleteSong(el.getAttribute('data-id')),
  'duplicate-song':el=>duplicateSong(el.getAttribute('data-id')),
  'fav-song':el=>toggleFavorite(el.getAttribute('data-id')),
  'song-to-setlist':el=>songToSetlist(el.getAttribute('data-id')),
  'export-song':el=>{const s=findSong(el.getAttribute('data-id'));if(!s)return;
    downloadFile(safeFile(s.title)+'.txt',songToText(s,State.ui.transpose||0),'text/plain;charset=utf-8');},
  'print-preview-song':el=>{const s=findSong(el.getAttribute('data-id'));if(s)printSongs([s],State.ui.transpose||0);},
  'save-version':async el=>{const s=findSong(el.getAttribute('data-id'));if(!s)return;
    await snapshotVersion(s);await logActivity('song','Зафиксирована версия «'+s.title+'»',s.id);renderSongDetail(s.id);},
  'restore-version':el=>restoreVersion(el.getAttribute('data-id')),
  'delete-version':el=>deleteVersion(el.getAttribute('data-id')),
  'transpose':el=>adjustTranspose(parseInt(el.getAttribute('data-d'),10)),
  'transpose-reset':()=>resetTranspose(),
  'toggle-select-mode':()=>{State.ui.selectMode=!State.ui.selectMode;
    if(!State.ui.selectMode)State.ui.selection.clear();
    renderSongList();renderSelectionBar();},
  'select-all':()=>{const list=filteredSongs();
    if(State.ui.selection.size===list.length)State.ui.selection.clear();else list.forEach(s=>State.ui.selection.add(s.id));
    renderSongList();renderSelectionBar();},
  'bulk-print':()=>{const songs=Array.from(State.ui.selection).map(findSong).filter(Boolean);if(songs.length)printSongs(songs,0);},
  'bulk-export':()=>bulkExportSelection(),
  'bulk-setlist':()=>bulkAddToSetlist(),
  'bulk-fav':()=>bulkFavorite(),
  'bulk-delete':()=>bulkDelete(),
  'band-tab':el=>{State.ui.bandTab=el.getAttribute('data-val');State.ui.bandQuery='';
    $$('#bandTabs .tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');renderBandContent();},
  'add-song-to-setlist':el=>addSongToSetlist(el.getAttribute('data-id')),
  'sl-remove':el=>removeSetlistItem(el.getAttribute('data-sl'),el.getAttribute('data-item')),
  'sl-edit-item':el=>editSetlistItem(el.getAttribute('data-sl'),el.getAttribute('data-item')),
  'sl-up':el=>moveSetlistItem(el.getAttribute('data-sl'),el.getAttribute('data-item'),-1),
  'sl-down':el=>moveSetlistItem(el.getAttribute('data-sl'),el.getAttribute('data-item'),1),
  'sl-song':el=>navigate('#/songs/'+el.getAttribute('data-id')),
  'sl-status':el=>setSetlistStatus(el.getAttribute('data-id'),el.getAttribute('data-val')),
  'print-setlist-full':el=>printSetlistDialog(el.getAttribute('data-id'),'full'),
  'print-setlist-short':el=>printSetlistDialog(el.getAttribute('data-id'),'short'),
  'export-setlist':el=>{const sl=findSetlist(el.getAttribute('data-id'));if(!sl)return;
    Modal.sheet('Экспорт «'+sl.name+'»',[
      {icon:'📄',label:'Полный текст с аккордами и динамикой (TXT)',run:()=>{downloadFile(safeFile(sl.name)+'.txt',setlistText(sl,'full'),'text/plain;charset=utf-8');}},
      {icon:'📋',label:'Краткий список (TXT)',run:()=>{downloadFile(safeFile(sl.name)+'-short.txt',setlistText(sl,'short'),'text/plain;charset=utf-8');}},
      {icon:'📊',label:'Таблица (CSV)',run:()=>{downloadFile(safeFile(sl.name)+'.csv',setlistCSV(sl),'text/csv;charset=utf-8');}},
      {icon:'🖨️',label:'Печать / PDF',run:()=>printSetlistDialog(sl.id,'full')}]);},
  'duplicate-setlist':el=>duplicateSetlist(el.getAttribute('data-id')),
  'delete-setlist':el=>confirmDeleteSetlist(el.getAttribute('data-id')),
  'setlist-for-event':el=>createSetlistForEvent(el.getAttribute('data-id')),
  'launch-scene':el=>launchScene(el.getAttribute('data-id')),
  'scene-from-song':el=>launchSceneFromSong(el.getAttribute('data-id'),false),
  'scene-from-song-auto':el=>launchSceneFromSong(el.getAttribute('data-id'),true),
  'scene-from-event':el=>launchSceneFromEvent(el.getAttribute('data-id')),
  'scene-font':el=>sceneFont(parseInt(el.getAttribute('data-d'),10)),
  'archive-group':el=>toggleGroupArchive(el.getAttribute('data-id')),
  'unarchive-group':el=>toggleGroupArchive(el.getAttribute('data-id')),
  'delete-group':el=>confirmDeleteGroup(el.getAttribute('data-id')),
  'delete-member':el=>confirmDeleteMember(el.getAttribute('data-id')),
  'group-assign-songs':el=>groupAssignSongs(el.getAttribute('data-id')),
  'group-unassign-song':el=>groupUnassignSong(el.getAttribute('data-id'),el.getAttribute('data-val')),
  'group-remove-logo':async el=>{const g=findGroup(el.getAttribute('data-id'));if(!g)return;
    if(g.logoFileId)await deleteFile(g.logoFileId);
    g.logoFileId=null;await saveGroup(g);Modal.close();handleRoute();},
  'manage-roles':()=>manageRoles(),
  'attach-file':el=>attachFile(el.getAttribute('data-kind'),el.getAttribute('data-owner')),
  'attach-logo':el=>attachFile('logo',el.getAttribute('data-id')),
  'open-file':el=>openFile(el.getAttribute('data-id')),
  'delete-file':el=>removeFile(el.getAttribute('data-id')),
  'set-theme':el=>{applyTheme(el.getAttribute('data-val'));if(State.ui.base==='/more')renderMore();},
  'set-accent':el=>{applyAccent(el.getAttribute('data-val'));$$('#accentRow .accent-swatch').forEach(x=>x.classList.toggle('on',x===el));buildManifest();},
  'export':()=>exportChooser(),
  'export-songs':()=>exportChooser(),
  'import':()=>triggerImport(),
  'backup-now':()=>exportAll(),
  'reset-demo':()=>resetDemoData(),
  'clear-all':()=>clearAllData(),
  'enable-notifications':()=>requestNotifications(),
  'test-notification':()=>{if(!State.settings.notifications){Toast.warning('Сначала включите напоминания');return;}
    const nxt=upcomingOccurrences(1)[0];
    notifyUser('Проверка уведомлений','Напоминания BandPlan работают. Следующее событие: '+(nxt?nxt.ev.title:'не запланировано'),()=>navigate('#/calendar'));},
  'persist-storage':()=>persistStorage(),
  'install-app':()=>installApp(),
  'install-dismiss':()=>{persistSetting('installDismissed',true);hideInstallBanner();},
  'logout':()=>logoutProfile(),
  'show-help':()=>showHelp(),
  'show-privacy':()=>showPrivacy(),
  'show-shortcuts':()=>showShortcuts()
};
function setlistText(sl,mode){
  const st=setlistStats(sl),g=findGroup(sl.groupId),ev=State.events.find(e=>e.setlistId===sl.id);
  const lines=[sl.name,'='.repeat(Math.max(10,sl.name.length))];
  if(g)lines.push('Группа: '+g.name);
  if(ev)lines.push('Событие: '+ev.title+' · '+formatDate(ev.start)+' '+formatTime(ev.start));
  lines.push('Статус: '+SETLIST_STATUS[sl.status||'active']);
  lines.push('Песен: '+st.count+' · Ориентировочное время: '+durationLabel(st.duration)+(st.avgBpm?' · Средний BPM: '+st.avgBpm:''));
  if(sl.notes)lines.push('Общие заметки: '+sl.notes);
  lines.push('');
  (sl.items||[]).forEach((it,i)=>{const s=findSong(it.songId);
    if(!s){lines.push((i+1)+'. (песня удалена из каталога)');return;}
    const lead=it.leadMemberId?findMember(it.leadMemberId):null;
    const semis=it.keyOverride?semitoneDiff(s.key,it.keyOverride):0;
    lines.push((i+1)+'. '+s.title+' ['+[it.keyOverride||s.key||'—',(it.bpmOverride||s.bpm||'—')+' BPM',s.timeSignature||'',s.duration?durationLabel(s.duration):''].filter(Boolean).join(' · ')+']');
    if(lead)lines.push('   Ответственный: '+lead.name);
    if(it.transition)lines.push('   Переход: '+it.transition);
    if(it.notes)lines.push('   Заметка: '+it.notes);
    if(mode==='full'){lines.push('');lines.push(transposeLyricsText(s.lyrics,semis));
      if(dynRows(s).length){const clone=Object.assign({},s);
        if(semis){clone.key=it.keyOverride;clone.lyrics=transposeLyricsText(s.lyrics,semis);}
        lines.push(dynamicsText(clone));}
      lines.push('\n'+'—'.repeat(44)+'\n');}});
  return lines.join('\n');}
function setlistCSV(sl){
  const rows=[['№','Песня','Исполнитель','Тональность','BPM','Размер','Длительность (с)','Ответственный','Переход','Заметка']];
  (sl.items||[]).forEach((it,i)=>{const s=findSong(it.songId)||{},lead=it.leadMemberId?findMember(it.leadMemberId):null;
    rows.push([i+1,s.title||'—',s.artist||s.author||'',it.keyOverride||s.key||'',it.bpmOverride||s.bpm||'',s.timeSignature||'',s.duration||'',lead?lead.name:'',it.transition||'',it.notes||'']);});
  return toCSV(rows);}
function wireGlobalClicks(){
  document.addEventListener('click',ev=>{
    const t=ev.target;if(!t||!t.closest)return;
    if(t.closest('[data-modal-close]')){Modal.close();return;}
    const go=t.closest('[data-go]');
    if(go){ev.preventDefault();navigate(go.getAttribute('data-go'));return;}
    const actEl=t.closest('[data-act]');
    if(actEl){const act=actEl.getAttribute('data-act'),fn=ACTIONS[act];
      if(typeof fn==='function'){ev.preventDefault();
        if(act!=='toggle-filter'&&act!=='close-filter')closeFilterDropdowns();
        try{const r=fn(actEl);if(r&&r.catch)r.catch(e=>{Logger.error('action '+act,e);Toast.error('Действие не выполнено');});}
        catch(e){Logger.error('action '+act,e);Toast.error('Действие не выполнено');}}
      return;}
    if(t.closest('.filter-menu'))return;
    closeFilterDropdowns();
    if(State.ui.selectMode){const card=t.closest('[data-song]');
      if(card){ev.preventDefault();const id=card.getAttribute('data-song');
        if(State.ui.selection.has(id))State.ui.selection.delete(id);else State.ui.selection.add(id);
        card.classList.toggle('selected',State.ui.selection.has(id));
        const chk=$('.select-check',card);if(chk)chk.textContent=State.ui.selection.has(id)?'✓':'';
        renderSelectionBar();return;}}
    const dayEl=t.closest('[data-day]');
    if(dayEl&&State.ui.base==='/calendar'&&State.ui.calendarView==='month'&&!t.closest('[data-drag-event]')){onDayCellClick(dayEl.getAttribute('data-day'));return;}
    const songEl=t.closest('[data-song]');if(songEl){navigate('#/songs/'+songEl.getAttribute('data-song'));return;}
    const slEl=t.closest('[data-sl]');if(slEl){navigate('#/band/setlist/'+slEl.getAttribute('data-sl'));return;}
    const evEl=t.closest('[data-event]');if(evEl){openEventDetails(evEl.getAttribute('data-event'),evEl.getAttribute('data-occ'));return;}
    const grEl=t.closest('[data-group]');if(grEl){navigate('#/band/group/'+grEl.getAttribute('data-group'));return;}
    const memEl=t.closest('[data-member]');if(memEl){openMemberEditor({id:memEl.getAttribute('data-member')});return;}
    if(!t.closest('#globalSearchWrap')&&!t.closest('#searchDropdown'))closeSearchDropdown();});
  document.addEventListener('keydown',ev=>{
    if(ev.key!=='Enter')return;
    const el=ev.target;if(!el||!el.closest)return;
    const go=el.closest('[data-go]');
    if(go){ev.preventDefault();navigate(go.getAttribute('data-go'));return;}
    const card=el.closest('[data-song],[data-sl],[data-event],[data-group],[data-member],[data-day]');
    if(card){ev.preventDefault();card.click();}});}
function onDayCellClick(k){
  const d=new Date(k+'T12:00:00');State.ui.selectedDate=d;
  const list=occurrencesOnDate(d);
  $$('.calendar-day').forEach(c=>c.classList.toggle('selected',c.getAttribute('data-day')===k));
  if(list.length===1)openEventDetails(list[0].ev.id,k);
  else if(!list.length)createEventAt(k,18*60);
  else{State.ui.calendarDate=d;setCalendarView('day');}}
function handleKeydown(e){
  const sceneOpen=$('#sceneOverlay').classList.contains('active');
  const paletteOpen=$('#cmdPaletteOverlay').classList.contains('active');
  const modalOpen=Modal.isOpen();
  const ae=document.activeElement,tag=ae?ae.tagName:'';
  const typing=['INPUT','TEXTAREA','SELECT'].indexOf(tag)>=0||(ae&&ae.isContentEditable);
  if(sceneOpen){
    switch(e.key){
      case 'ArrowLeft':e.preventDefault();scenePrev();return;
      case 'ArrowRight':e.preventDefault();sceneNext();return;
      case ' ':if(!typing){e.preventDefault();toggleSceneAuto();}return;
      case '+':case '=':e.preventDefault();sceneFont(2);return;
      case '-':case '_':e.preventDefault();sceneFont(-2);return;
      case '#':e.preventDefault();sceneTranspose(1);return;
      case 'b':if(e.altKey){e.preventDefault();sceneTranspose(-1);}return;
      case 'f':case 'F':if(!typing){e.preventDefault();sceneFullscreen();}return;
      case 'Escape':e.preventDefault();exitScene();return;
      default:return;}}
  if((e.ctrlKey||e.metaKey)&&['k','K','л','Л'].indexOf(e.key)>=0){
    e.preventDefault();
    if(paletteOpen)closeCmdPalette();else{if(modalOpen)Modal.close();openCmdPalette();}
    return;}
  if(e.key==='Escape'){
    if(paletteOpen){closeCmdPalette();return;}
    if(modalOpen){Modal.close();return;}
    if($('.filter-dropdown.open')){closeFilterDropdowns();return;}
    if($('#searchDropdown').classList.contains('active')){closeSearchDropdown();return;}
    if(State.ui.selectMode){State.ui.selectMode=false;State.ui.selection.clear();renderSongList();renderSelectionBar();return;}}
  if(paletteOpen){
    if(e.key==='ArrowDown'){e.preventDefault();cmdIdx=Math.min(cmdResults.length-1,cmdIdx+1);highlightCmd();}
    else if(e.key==='ArrowUp'){e.preventDefault();cmdIdx=Math.max(0,cmdIdx-1);highlightCmd();}
    else if(e.key==='Enter'){e.preventDefault();runCmd(cmdIdx);}
    return;}
  if(typing||modalOpen)return;
  if(State.ui.base==='/calendar'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter'].indexOf(e.key)>=0){
    const d=new Date(State.ui.calendarDate),v=State.ui.calendarView;
    if(e.key!=='Enter'){e.preventDefault();
      if(e.key==='ArrowLeft')d.setDate(d.getDate()-1);
      if(e.key==='ArrowRight')d.setDate(d.getDate()+1);
      if(e.key==='ArrowUp')d.setDate(d.getDate()-(v==='month'?7:1));
      if(e.key==='ArrowDown')d.setDate(d.getDate()+(v==='month'?7:1));
      State.ui.calendarDate=d;State.ui.selectedDate=d;
      if(v==='month'||v==='agenda')renderCalendar();else renderCalendarContent();
      return;}
    e.preventDefault();
    const list=occurrencesOnDate(d);
    if(list.length)openEventDetails(list[0].ev.id,dateKey(d));else createEventAt(dateKey(d),18*60);
    return;}
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  const k=e.key.toLowerCase();
  if(k==='n'||k==='т'){e.preventDefault();openSongEditor();}
  else if(k==='e'||k==='у'){e.preventDefault();openEventEditor();}
  else if(k==='s'||k==='ы'){e.preventDefault();openSetlistEditor();}
  else if(k==='t'||k==='е'){e.preventDefault();toggleTheme();}
  else if(k==='?'||(k==='/'&&e.shiftKey)){e.preventDefault();showShortcuts();}
  else if(k==='g'||k==='п'){State.ui._gPrefix=true;setTimeout(()=>{State.ui._gPrefix=false;},1200);}
  else if(State.ui._gPrefix){State.ui._gPrefix=false;
    if(k==='c'||k==='с')navigate('#/calendar');
    else if(k==='s'||k==='ы')navigate('#/songs');
    else if(k==='b'||k==='и')navigate('#/band');
    else if(k==='m'||k==='ь')navigate('#/more');}}
const refreshCountdowns=throttleRAF(function(){
  $$('[data-countdown]').forEach(el=>{const iso=el.getAttribute('data-countdown');if(iso)el.textContent=countdownText(iso);});});
function wireStaticEvents(){
  window.addEventListener('hashchange',handleRoute);
  window.addEventListener('online',()=>{if(State.ui.base==='/more')renderMore();});
  window.addEventListener('offline',()=>{if(State.ui.base==='/more')renderMore();});
  const bind=(sel,ev,fn,o)=>{const x=$(sel);if(x)x.addEventListener(ev,fn,o);};
  bind('#themeQuickToggle','click',toggleTheme);
  bind('#themeQuickToggleTop','click',toggleTheme);
  bind('#cmdPaletteBtn','click',openCmdPalette);
  bind('#installBtn','click',installApp);
  bind('#installSideBtn','click',installApp);
  bind('#cmdPaletteOverlay','click',ev=>{if(ev.target.id==='cmdPaletteOverlay')closeCmdPalette();});
  bind('#modalOverlay','click',ev=>{if(ev.target.id==='modalOverlay')Modal.close();});
  bind('#cmdInput','input',debounce(ev=>renderCmdResults(ev.target.value),120),{passive:true});
  bind('#fileInput','change',()=>handleFilesPicked($('#fileInput')),{passive:true});
  const gs=$('#globalSearch');
  gs.addEventListener('input',debounce(ev=>handleGlobalSearch(ev.target.value),170),{passive:true});
  gs.addEventListener('focus',ev=>{if(ev.target.value.trim().length>=2)handleGlobalSearch(ev.target.value);});
  gs.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'){closeSearchDropdown();gs.blur();}
    if(ev.key==='Enter'){const first=$('#searchDropdown .search-result-item');
      if(first){ev.preventDefault();first.click();}
      else if(gs.value.trim()){ev.preventDefault();closeSearchDropdown();State.ui.songs.query=gs.value.trim();gs.value='';navigate('#/songs');}}});
  bind('#scenePrev','click',scenePrev);
  bind('#sceneNext','click',sceneNext);
  bind('#sceneScroll','click',toggleSceneAuto);
  bind('#sceneSpeed','click',cycleSceneSpeed);
  bind('#sceneFontInc','click',()=>sceneFont(2));
  bind('#sceneFontDec','click',()=>sceneFont(-2));
  bind('#sceneTransInc','click',()=>sceneTranspose(1));
  bind('#sceneTransDec','click',()=>sceneTranspose(-1));
  bind('#sceneFullscreen','click',sceneFullscreen);
  bind('#sceneExit','click',exitScene);
  bind('#sceneLyrics','scroll',updateSceneProgress,{passive:true});
  bind('#sceneLyrics','wheel',()=>{if(State.ui.scene.auto)toggleSceneAuto();},{passive:true});
  bind('#sceneLyrics','touchstart',()=>{if(State.ui.scene.auto)toggleSceneAuto();},{passive:true});
  document.addEventListener('keydown',handleKeydown);
  setupSceneTouch();setupTabSwipe();
  State.subscribe(updateNavCounts);
  if(systemMQ&&systemMQ.addEventListener)systemMQ.addEventListener('change',()=>{if(State.settings.systemTheme)applyTheme('system',true);});
  setInterval(()=>{refreshCountdowns();
    if(State.ui.base==='/calendar'&&State.ui.calendarView==='week'&&!State.ui.dragging&&!Modal.isOpen()){
      const line=$('#tgridNow');
      if(line){const n=new Date();line.style.top=clamp(n.getHours()*60+n.getMinutes()-GRID_START*60,0,(GRID_END-GRID_START)*60)*PX_PER_MIN+'px';}}},30000);
  window.addEventListener('beforeunload',()=>{stopSceneScroll();releaseWakeLock();});
  window.addEventListener('error',ev=>Logger.error('runtime',ev.message));
  window.addEventListener('unhandledrejection',ev=>Logger.error('promise',ev.reason));}
async function init(){
  try{await loadState();}
  catch(err){Logger.error('loadState',err);rebuildIndex();Toast.error('Локальная база недоступна — данные сохранятся только в этой сессии');}
  buildManifest();
  wireStaticEvents();
  wireGlobalClicks();
  State.ready=true;
  handleRoute();
  startReminderScheduler();
  setupInstallPrompt();
  const empty=!State.songs.length&&!State.events.length&&!State.groups.length&&!State.members.length;
  if(empty&&!State.settings.onboardingDone)startOnboarding();
  else{State.settings.onboardingDone=true;writePrefs({onboardingDone:true});}
  if(storageMode!=='indexeddb')Toast.warning('IndexedDB недоступен: изменения сохранятся только до закрытия вкладки. Создайте резервную копию.');}
window.BP={State,navigate,handleRoute,openSongEditor,openEventEditor,openSetlistEditor,openGroupEditor,openMemberEditor,
  openEventDetails,launchScene,launchSceneFromEvent,launchSceneFromSong,exitScene,manageRoles,exportAll,exportChooser,
  resetDemoData,clearAllData,applyTheme,applyAccent,toggleTheme,openCmdPalette,showHelp,showPrivacy,showShortcuts,installApp,
  Toast,Modal,transposeChord,extractChords,version:'4.1'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();