const movies = [
  { id: 1, title: '流浪地球3', genre: '科幻 / 冒险', rating: 9.2, releaseDate: '2026-02-10', price: 45, poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=520&auto=format&fit=crop', desc: '太阳危机再度升级，地球派遣远航舰队寻找新的生存坐标。', nowPlaying: true },
  { id: 2, title: '深海探秘', genre: '纪录片', rating: 8.9, releaseDate: '2026-01-15', price: 38, poster: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=520&auto=format&fit=crop', desc: '潜入未知海沟，记录深海生命与人类探索极限。', nowPlaying: true },
  { id: 3, title: '星际穿越2', genre: '科幻 / 剧情', rating: 9.0, releaseDate: '2026-03-01', price: 50, poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=520&auto=format&fit=crop', desc: '新的虫洞被发现，人类再一次面对时间、亲情与文明延续的抉择。', nowPlaying: true },
  { id: 4, title: '古城谜案', genre: '悬疑 / 犯罪', rating: 8.5, releaseDate: '2026-01-20', price: 35, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=520&auto=format&fit=crop', desc: '千年古城发生离奇命案，线索隐藏在壁画与传说之间。', nowPlaying: true },
  { id: 5, title: '青春之歌', genre: '爱情 / 青春', rating: 7.8, releaseDate: '2026-02-14', price: 32, poster: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=520&auto=format&fit=crop', desc: '从校园到都市，一段跨越十年的青春约定。', nowPlaying: true },
  { id: 6, title: '机甲风暴', genre: '动作 / 科幻', rating: 8.3, releaseDate: '2026-04-10', price: 48, poster: 'https://images.unsplash.com/photo-1535378437327-b71494669e80?w=520&auto=format&fit=crop', desc: '巨型机甲军团集结，守卫最后的环太平洋防线。', nowPlaying: false },
  { id: 7, title: '山海经奇缘', genre: '动画 / 奇幻', rating: 8.7, releaseDate: '2026-05-01', price: 40, poster: 'https://images.unsplash.com/photo-1560167016-022b78a0258e?w=520&auto=format&fit=crop', desc: '少年误入山海世界，与神兽同行寻找回家的路。', nowPlaying: false },
  { id: 8, title: '暗夜追凶', genre: '惊悚 / 犯罪', rating: 8.1, releaseDate: '2026-03-20', price: 36, poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=520&auto=format&fit=crop', desc: '雨夜连环案件重启，刑警必须在下一次钟声前锁定凶手。', nowPlaying: false }
];

const cinemas = [
  { id: 1, name: '星光影城（市中心店）', address: '市中心商业广场 5 楼' },
  { id: 2, name: '星光影城（万达广场店）', address: '万达广场 3 楼' },
  { id: 3, name: '星光影城（大学城店）', address: '大学城商业街 2 楼' }
];

let currentBooking = { movie: null, cinema: null, showtime: null, seats: [], seatMap: [] };
let currentFilters = { page: 'now-playing', genre: '全部', keyword: '' };

function getOrders() {
  return JSON.parse(localStorage.getItem('movie_orders') || '[]');
}

function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem('movie_orders', JSON.stringify(orders));
}

function generateShowtimes(movieId) {
  const basePrice = movies.find(movie => movie.id === movieId).price;
  return ['09:30', '12:00', '14:30', '17:00', '19:30', '22:00'].map((time, index) => ({
    id: index + 1,
    time,
    hall: `第${index + 1}放映厅`,
    price: basePrice + (index >= 4 ? 8 : 0)
  }));
}

function seededOccupied(showtimeId, rowIndex, col) {
  const seed = currentBooking.movie.id * 17 + currentBooking.cinema.id * 11 + showtimeId * 7 + rowIndex * 5 + col * 3;
  return seed % 9 === 0 || seed % 13 === 0;
}

function generateSeats(showtimeId) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seats = [];
  rows.forEach((row, rowIndex) => {
    for (let col = 1; col <= 10; col += 1) {
      seats.push({ id: `${row}${col}`, row, col, status: seededOccupied(showtimeId, rowIndex, col) ? 'occupied' : 'available' });
    }
  });
  return seats;
}

function showPage(pageName) {
  if (pageName === 'now-playing' || pageName === 'coming-soon') {
    currentFilters.page = pageName;
    currentFilters.genre = '全部';
    currentFilters.keyword = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
  }
  document.querySelectorAll('.page-content').forEach(page => page.classList.add('d-none'));
  document.getElementById(`page-${pageName}`).classList.remove('d-none');
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.getElementById(`nav-${pageName}`);
  if (activeLink) activeLink.classList.add('active');
  window.scrollTo(0, 0);

  if (pageName === 'home') renderHome();
  if (pageName === 'now-playing') renderNowPlaying();
  if (pageName === 'coming-soon') renderComingSoon();
  if (pageName === 'orders') renderOrders();
  if (pageName === 'profile') renderProfile();
}

function createMovieCard(movie, canBook = true) {
  return `
    <div class="col-lg-3 col-md-4 col-sm-6">
      <div class="movie-card">
        <div class="poster-wrapper">
          <img src="${movie.poster}" alt="${movie.title}">
          <span class="rating-badge"><i class="bi bi-star-fill"></i> ${movie.rating}</span>
        </div>
        <div class="card-body">
          <h5 class="card-title" title="${movie.title}">${movie.title}</h5>
          <div class="movie-meta">${movie.genre} | ${movie.releaseDate}</div>
          <div class="movie-desc">${movie.desc}</div>
          ${canBook ? `<button class="btn btn-primary btn-book" onclick="startBooking(${movie.id})">选座购票</button>` : '<button class="btn btn-outline-secondary btn-book" disabled>即将上映</button>'}
        </div>
      </div>
    </div>`;
}

function renderHome() {
  document.getElementById('home-movies-grid').innerHTML = movies.filter(movie => movie.nowPlaying).slice(0, 4).map(movie => createMovieCard(movie)).join('');
  document.getElementById('home-coming-grid').innerHTML = movies.filter(movie => !movie.nowPlaying).map(movie => createMovieCard(movie, false)).join('');
}

function splitGenres(movie) {
  return movie.genre.split('/').map(item => item.trim());
}

function getGenres(isNowPlaying) {
  const genreSet = new Set();
  movies.filter(movie => movie.nowPlaying === isNowPlaying).forEach(movie => {
    splitGenres(movie).forEach(genre => genreSet.add(genre));
  });
  return ['全部', ...Array.from(genreSet)];
}

function renderGenreFilter(containerId, isNowPlaying) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = getGenres(isNowPlaying).map(genre => `
    <button type="button" class="genre-chip ${currentFilters.genre === genre ? 'active' : ''}" onclick="selectGenre('${genre}')">${genre}</button>
  `).join('');
}

function filterMovies(isNowPlaying) {
  return movies.filter(movie => {
    const matchStatus = movie.nowPlaying === isNowPlaying;
    const matchGenre = currentFilters.genre === '全部' || splitGenres(movie).includes(currentFilters.genre);
    const matchKeyword = !currentFilters.keyword || movie.title.toLowerCase().includes(currentFilters.keyword);
    return matchStatus && matchGenre && matchKeyword;
  });
}

function renderMovieResults(containerId, list, canBook) {
  document.getElementById(containerId).innerHTML = list.length
    ? list.map(movie => createMovieCard(movie, canBook && movie.nowPlaying)).join('')
    : '<div class="col-12"><div class="alert alert-warning">没有找到符合条件的电影。</div></div>';
}

function renderNowPlaying() {
  renderGenreFilter('now-playing-genre-filter', true);
  renderMovieResults('now-playing-grid', filterMovies(true), true);
}

function renderComingSoon() {
  renderGenreFilter('coming-soon-genre-filter', false);
  renderMovieResults('coming-soon-grid', filterMovies(false), false);
}

function selectGenre(genre) {
  currentFilters.genre = genre;
  if (currentFilters.page === 'coming-soon') renderComingSoon();
  else renderNowPlaying();
}

function searchMovies(event) {
  event.preventDefault();
  const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
  currentFilters.keyword = keyword;
  currentFilters.genre = '全部';
  currentFilters.page = 'now-playing';
  showPage('now-playing');
  currentFilters.keyword = keyword;
  renderNowPlaying();
}

function startBooking(movieId) {
  const movie = movies.find(item => item.id === movieId);
  currentBooking = { movie, cinema: null, showtime: null, seats: [], seatMap: [] };
  document.getElementById('booking-poster').src = movie.poster;
  document.getElementById('booking-title').textContent = movie.title;
  document.getElementById('booking-info').innerHTML = `<p>类型：${movie.genre}</p><p>上映：${movie.releaseDate}</p><p>评分：<span class="text-warning">${movie.rating}</span></p><p>${movie.desc}</p>`;
  renderCinemas();
  document.getElementById('showtime-list').innerHTML = '<div class="text-muted">请先选择影院</div>';
  clearSeats();
  showPage('booking');
}

function renderCinemas() {
  document.getElementById('cinema-list').innerHTML = cinemas.map(cinema => `
    <div class="cinema-item ${currentBooking.cinema?.id === cinema.id ? 'active' : ''}" onclick="selectCinema(${cinema.id})">
      <strong>${cinema.name}</strong><br><small>${cinema.address}</small>
    </div>`).join('');
}

function selectCinema(cinemaId) {
  currentBooking.cinema = cinemas.find(cinema => cinema.id === cinemaId);
  currentBooking.showtime = null;
  currentBooking.seats = [];
  renderCinemas();
  renderShowtimes();
  clearSeats();
}

function renderShowtimes() {
  const showtimes = generateShowtimes(currentBooking.movie.id);
  document.getElementById('showtime-list').innerHTML = showtimes.map(showtime => `
    <div class="showtime-item ${currentBooking.showtime?.id === showtime.id ? 'active' : ''}" onclick="selectShowtime(${showtime.id})">
      <div class="time">${showtime.time}</div>
      <small>${showtime.hall}</small><br>
      <span class="price">¥${showtime.price}</span>
    </div>`).join('');
}

function selectShowtime(showtimeId) {
  currentBooking.showtime = generateShowtimes(currentBooking.movie.id).find(showtime => showtime.id === showtimeId);
  currentBooking.seats = [];
  currentBooking.seatMap = generateSeats(showtimeId);
  renderShowtimes();
  renderSeats();
  updateSummary();
}

function clearSeats() {
  document.getElementById('seat-map').innerHTML = '<div class="text-muted py-4">请选择影院和场次后查看座位图</div>';
  updateSummary();
}

function renderSeats() {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  document.getElementById('seat-map').innerHTML = rows.map(row => {
    const seats = currentBooking.seatMap.filter(seat => seat.row === row).map(seat => `
      <div class="seat ${seat.status}" title="${seat.id}" onclick="toggleSeat('${seat.id}')">${seat.col}</div>`).join('');
    return `<div class="seat-row"><span class="row-label">${row}</span>${seats}</div>`;
  }).join('');
}

function toggleSeat(seatId) {
  const seat = currentBooking.seatMap.find(item => item.id === seatId);
  if (!seat || seat.status === 'occupied') return;

  if (seat.status === 'selected') {
    seat.status = 'available';
    currentBooking.seats = currentBooking.seats.filter(id => id !== seatId);
  } else {
    seat.status = 'selected';
    currentBooking.seats.push(seatId);
  }
  renderSeats();
  updateSummary();
}

function updateSummary() {
  const hasShowtime = Boolean(currentBooking.showtime);
  const total = hasShowtime ? currentBooking.seats.length * currentBooking.showtime.price : 0;
  document.getElementById('selected-seats').textContent = currentBooking.seats.length ? currentBooking.seats.join('、') : '无';
  document.getElementById('ticket-price').textContent = hasShowtime ? currentBooking.showtime.price : 0;
  document.getElementById('total-price').textContent = total;
  document.getElementById('confirm-btn').disabled = currentBooking.seats.length === 0;
}

function showCheckout() {
  if (!currentBooking.movie || !currentBooking.cinema || !currentBooking.showtime || !currentBooking.seats.length) return;
  const total = currentBooking.seats.length * currentBooking.showtime.price;
  document.getElementById('checkout-details').innerHTML = `
    <div class="checkout-line"><strong>电影：</strong>${currentBooking.movie.title}</div>
    <div class="checkout-line"><strong>影院：</strong>${currentBooking.cinema.name}</div>
    <div class="checkout-line"><strong>场次：</strong>${currentBooking.showtime.time} ${currentBooking.showtime.hall}</div>
    <div class="checkout-line"><strong>座位：</strong>${currentBooking.seats.join('、')}</div>
    <div class="checkout-line"><strong>票数：</strong>${currentBooking.seats.length} 张</div>
    <div class="checkout-total">总金额：¥${total}</div>`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('checkoutModal')).show();
}

function submitOrder() {
  const total = currentBooking.seats.length * currentBooking.showtime.price;
  const order = {
    id: `ORD${Date.now()}`,
    movieId: currentBooking.movie.id,
    movieTitle: currentBooking.movie.title,
    poster: currentBooking.movie.poster,
    cinema: currentBooking.cinema.name,
    showtime: `${currentBooking.showtime.time} ${currentBooking.showtime.hall}`,
    seats: [...currentBooking.seats],
    amount: total,
    createdAt: new Date().toLocaleString('zh-CN'),
    status: '购票成功'
  };
  saveOrder(order);
  bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
  bootstrap.Toast.getOrCreateInstance(document.getElementById('successToast')).show();
  currentBooking.seats.forEach(seatId => {
    const seat = currentBooking.seatMap.find(item => item.id === seatId);
    if (seat) seat.status = 'occupied';
  });
  currentBooking.seats = [];
  renderSeats();
  updateSummary();
  setTimeout(() => showPage('orders'), 700);
}

function renderOrders() {
  const orders = getOrders();
  const container = document.getElementById('orders-list');
  if (!orders.length) {
    container.innerHTML = '<div class="alert alert-info">暂无订单。去“正在热映”选择一部电影购票吧。</div>';
    return;
  }
  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <strong>订单号：${order.id}</strong>
        <span class="order-status status-success">${order.status}</span>
      </div>
      <div class="order-details">
        <img src="${order.poster}" alt="${order.movieTitle}">
        <div class="order-info">
          <h5>${order.movieTitle}</h5>
          <p><i class="bi bi-building"></i> ${order.cinema}</p>
          <p><i class="bi bi-clock"></i> ${order.showtime}</p>
          <p><i class="bi bi-grid-3x3-gap"></i> 座位：${order.seats.join('、')}</p>
          <p><i class="bi bi-calendar-check"></i> 下单时间：${order.createdAt}</p>
          <div class="order-total">¥${order.amount}</div>
        </div>
      </div>
    </div>`).join('');
}

function renderProfile() {
  const orders = getOrders();
  document.getElementById('order-count').textContent = orders.length;
  document.getElementById('movie-count').textContent = orders.reduce((sum, order) => sum + order.seats.length, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  renderHome();
});
