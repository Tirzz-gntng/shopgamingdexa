const DEFAULT_PRODUCTS = [
  {id:1,name:"Starter Pack",price:15000,category:"digital",badge:"DIGITAL",icon:"⚡",image:"",stock:99,desc:"Paket digital untuk kebutuhan awal."},
  {id:2,name:"Premium Access",price:35000,category:"premium",badge:"PREMIUM",icon:"✦",image:"",stock:25,desc:"Akses premium dengan benefit tambahan."},
  {id:3,name:"Produk Custom",price:50000,category:"digital",badge:"CUSTOM",icon:"◉",image:"",stock:10,desc:"Produk yang dapat disesuaikan."},
  {id:4,name:"Merch Bundle",price:75000,category:"fisik",badge:"READY",icon:"▣",image:"",stock:8,desc:"Bundle produk fisik pilihan."},
  {id:5,name:"Pro Package",price:99000,category:"premium",badge:"BEST SELLER",icon:"♛",image:"",stock:20,desc:"Paket lengkap kebutuhan Anda."},
  {id:6,name:"Express Item",price:25000,category:"fisik",badge:"FAST",icon:"↗",image:"",stock:15,desc:"Item dengan proses cepat."}
];

let products = JSON.parse(localStorage.getItem("orderhub-products")) || DEFAULT_PRODUCTS;
let cart = JSON.parse(localStorage.getItem("orderhub-cart-v2")) || [];
let orders = JSON.parse(localStorage.getItem("orderhub-orders")) || [];
let settings = JSON.parse(localStorage.getItem("orderhub-settings")) || {storeName:"ORDERHUB",serviceFee:1000,checkoutNote:"Payment gateway belum aktif — siap dihubungkan dari backend/API."};
let activeFilter = "all";

const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
function save(){localStorage.setItem("orderhub-products",JSON.stringify(products));localStorage.setItem("orderhub-cart-v2",JSON.stringify(cart));localStorage.setItem("orderhub-orders",JSON.stringify(orders));localStorage.setItem("orderhub-settings",JSON.stringify(settings));}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");clearTimeout(window.t);window.t=setTimeout(()=>$("toast").classList.remove("show"),2400)}
function subtotal(){return cart.reduce((a,i)=>{let p=products.find(x=>x.id===i.id);return a+(p?p.price*i.qty:0)},0)}
function total(){let s=subtotal();return s+(s?Number(settings.serviceFee||0):0)}

function renderFilters(){
  const cats=["all",...new Set(products.map(p=>p.category).filter(Boolean))];
  $("filters").innerHTML=cats.map(c=>`<button class="${c===activeFilter?"active":""}" onclick="setFilter('${c.replace(/'/g,"\\'")}')">${c==="all"?"SEMUA":c.toUpperCase()}</button>`).join("");
}
function renderProducts(){
  const list=activeFilter==="all"?products:products.filter(p=>p.category===activeFilter);
  $("productGrid").innerHTML=list.length?list.map(p=>`<article class="product-card ${p.stock<=0?"out":""}">
    <div class="product-image">${p.image?`<img src="${p.image}" alt="${p.name}">`:(p.icon||"📦")}</div>
    <div class="product-top"><div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.desc||"")}</p></div><span class="badge">${escapeHtml(p.badge||"PRODUK")}</span></div>
    <div class="product-bottom"><div><strong>${money(p.price)}</strong><span class="stock"> • Stok ${p.stock}</span></div><button class="add-btn" onclick="addToCart(${p.id})" ${p.stock<=0?"disabled":""}>+</button></div>
  </article>`).join(""):`<p>Belum ada produk pada kategori ini.</p>`;
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function setFilter(c){activeFilter=c;renderFilters();renderProducts()}

function addToCart(id){
  const p=products.find(x=>x.id===id); if(!p||p.stock<=0)return;
  const item=cart.find(x=>x.id===id); const current=item?item.qty:0;
  if(current>=p.stock){toast("Jumlah melebihi stok.");return}
  item?item.qty++:cart.push({id,qty:1});save();renderCart();toast("Produk ditambahkan.");
}
function changeQty(id,d){
  const i=cart.findIndex(x=>x.id===id);if(i<0)return; const p=products.find(x=>x.id===id);
  if(d>0&&cart[i].qty>=p.stock){toast("Stok tidak mencukupi.");return}
  cart[i].qty+=d;if(cart[i].qty<=0)cart.splice(i,1);save();renderCart();
}
function renderCart(){
  cart=cart.filter(i=>products.some(p=>p.id===i.id));
  const count=cart.reduce((a,i)=>a+i.qty,0);$("cartCount").textContent=count;
  $("subtotal").textContent=money(subtotal());$("fee").textContent=money(subtotal()?settings.serviceFee:0);$("total").textContent=money(total());$("drawerTotal").textContent=money(total());
  $("cartItems").innerHTML=cart.length?cart.map(i=>{let p=products.find(x=>x.id===i.id);return `<div class="cart-item"><div class="cart-icon">${p.icon||"📦"}</div><div><b>${escapeHtml(p.name)}</b><small>${money(p.price)}</small></div><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button> <b>${i.qty}</b> <button onclick="changeQty(${p.id},1)">+</button></div></div>`}).join(""):`<p style="text-align:center;color:#777;padding:40px 0">Keranjang masih kosong.</p>`;
}

function openAdmin(){renderAdmin();$("adminModal").classList.add("open")}
function renderAdmin(){
  $("statProducts").textContent=products.length;$("statOrders").textContent=orders.length;
  $("statRevenue").textContent=money(orders.reduce((a,o)=>a+Number(o.total||0),0));
  $("adminProducts").innerHTML=products.map(p=>`<div class="admin-product"><div><b>${escapeHtml(p.name)}</b><small>${money(p.price)} • ${p.category} • stok ${p.stock}</small></div><div class="actions"><button onclick="editProduct(${p.id})">Edit</button><button class="delete" onclick="deleteProduct(${p.id})">Hapus</button></div></div>`).join("")||"<p>Belum ada produk.</p>";
  $("adminOrders").innerHTML=orders.length?orders.slice().reverse().map(o=>`<div class="admin-order"><div><b>#${o.id} — ${escapeHtml(o.customer.name)}</b><small>${o.items.map(x=>x.name+" x"+x.qty).join(", ")} • ${money(o.total)} • ${new Date(o.createdAt).toLocaleString("id-ID")}</small></div><b>${o.status}</b></div>`).join(""):"<p>Belum ada pesanan.</p>";
  $("storeName").value=settings.storeName||"ORDERHUB";$("serviceFeeSetting").value=settings.serviceFee||0;$("checkoutNoteSetting").value=settings.checkoutNote||"";
}
function resetProductForm(){ $("productForm").reset();$("productId").value="";$("productFormTitle").textContent="Tambah Produk";$("pIcon").value="📦" }
function editProduct(id){const p=products.find(x=>x.id===id);if(!p)return;$("productId").value=p.id;$("pName").value=p.name;$("pPrice").value=p.price;$("pCategory").value=p.category;$("pStock").value=p.stock;$("pBadge").value=p.badge||"";$("pIcon").value=p.icon||"";$("pImage").value=p.image||"";$("pDesc").value=p.desc||"";$("productFormTitle").textContent="Edit Produk";document.querySelector('[data-tab="manage-products"]').click()}
function deleteProduct(id){if(!confirm("Hapus produk ini?"))return;products=products.filter(p=>p.id!==id);cart=cart.filter(c=>c.id!==id);save();renderAll();renderAdmin();toast("Produk dihapus.");}

$("productForm").addEventListener("submit",e=>{
  e.preventDefault();const id=Number($("productId").value);const data={name:$("pName").value.trim(),price:Number($("pPrice").value),category:$("pCategory").value.trim().toLowerCase(),stock:Number($("pStock").value),badge:$("pBadge").value.trim(),icon:$("pIcon").value.trim()||"📦",image:$("pImage").value.trim(),desc:$("pDesc").value.trim()};
  if(id){const i=products.findIndex(p=>p.id===id);products[i]={...products[i],...data}}else products.push({id:Date.now(),...data});
  save();resetProductForm();renderAll();renderAdmin();toast("Produk berhasil disimpan.");
});

$("settingsForm").addEventListener("submit",e=>{e.preventDefault();settings={storeName:$("storeName").value.trim()||"ORDERHUB",serviceFee:Number($("serviceFeeSetting").value||0),checkoutNote:$("checkoutNoteSetting").value.trim()};save();document.querySelector(".brand").lastChild.textContent=" "+settings.storeName;renderCart();toast("Settings disimpan.");});
$("clearOrders").addEventListener("click",()=>{if(confirm("Hapus semua data pesanan?")){orders=[];save();renderAdmin();toast("Pesanan dihapus.");}});

$("checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();if(!cart.length){toast("Keranjang masih kosong.");return}
  const order={id:"ORD"+Date.now(),customer:{name:$("customerName").value.trim(),phone:$("customerPhone").value.trim(),email:$("customerEmail").value.trim(),note:$("customerNote").value.trim()},items:cart.map(i=>{let p=products.find(x=>x.id===i.id);return {id:p.id,name:p.name,price:p.price,qty:i.qty}}),subtotal:subtotal(),fee:settings.serviceFee,total:total(),status:"MENUNGGU PEMBAYARAN",createdAt:new Date().toISOString()};
  orders.push(order);
  // Kurangi stok
  order.items.forEach(i=>{const p=products.find(x=>x.id===i.id);if(p)p.stock=Math.max(0,p.stock-i.qty)});
  cart=[];save();renderAll();
  console.log("ORDER DATA:",order);
  // ================= PAYMENT GATEWAY =================
  // Kirim `order` ke backend Anda di sini.
  // Backend membuat transaksi ke Midtrans/Xendit/Tripay/dll.
  // Jangan taruh SECRET API KEY di frontend.
  //
  // fetch("/api/create-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(order)})
  //   .then(r=>r.json()).then(data=>location.href=data.payment_url);
  // ===================================================
  toast("Order berhasil dibuat! Siap dihubungkan ke payment gateway.");
  $("checkoutForm").reset();
});

$("cartBtn").onclick=()=>$("cartDrawer").classList.add("open");$("closeCart").onclick=()=>$("cartDrawer").classList.remove("open");
$("checkoutScroll").onclick=()=>{$("cartDrawer").classList.remove("open");$("order").scrollIntoView({behavior:"smooth"})};
$("adminBtn").onclick=openAdmin;$("mobileAdminBtn").onclick=()=>{openAdmin();$("mobileMenu").classList.remove("open")};$("closeAdmin").onclick=()=>$("adminModal").classList.remove("open");
$("menuBtn").onclick=()=>$("mobileMenu").classList.add("open");$("closeMenu").onclick=()=>$("mobileMenu").classList.remove("open");
$("mobileMenu").querySelectorAll("a").forEach(a=>a.onclick=()=>$("mobileMenu").classList.remove("open"));
document.querySelectorAll(".admin-tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".admin-tabs button").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")});
$("resetProductForm").onclick=resetProductForm;
function renderAll(){renderFilters();renderProducts();renderCart()}
window.setFilter=setFilter;window.addToCart=addToCart;window.changeQty=changeQty;window.editProduct=editProduct;window.deleteProduct=deleteProduct;
renderAll();