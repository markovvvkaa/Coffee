import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import heroImage from './assets/hero.jpg'
import { BASE_MENU } from './data/menu'
import { filterMenu, paginate, sortMenu, type CategoryFilter, type SortOrder } from './utils/catalog'
import { cartCount, cartLines, cartTotal, pruneCart, setQty, type Cart } from './utils/cart'
import {
  addItem, applyMenuState, EMPTY_STATE, parseCart, parseMenuState, popularItem, removeItem, setPopular, updateItem,
} from './utils/menuState'
import { buildOrder, parseOrders } from './utils/orders'
import type { OrderForm } from './utils/validation'
import { readStorage, useStoredState, writeStorage } from './hooks/useStoredState'
import Header from './components/Header'
import Hero from './components/Hero'
import MenuSection from './components/MenuSection'
import PopularBanner from './components/PopularBanner'
import Footer, { type InfoTopic } from './components/Footer'
import ProductDialog from './components/ProductDialog'
import CartDrawer from './components/CartDrawer'
import OrderDialog from './components/OrderDialog'
import AdminDialog from './components/AdminDialog'
import InfoDialog from './components/InfoDialog'

const PER_PAGE = 6
const KEYS = { menu: 'coffee:menu', cart: 'coffee:cart', orders: 'coffee:orders' }
type DialogName = 'cart' | 'order' | 'admin' | null

export default function App() {
  const [menuState, setMenuState] = useStoredState(KEYS.menu, parseMenuState)
  const [storedCart, setCart] = useStoredState<Cart>(KEYS.cart, parseCart)
  const menu = useMemo(() => applyMenuState(BASE_MENU, menuState), [menuState])
  const cart = useMemo(() => pruneCart(storedCart, menu), [storedCart, menu])
  const lines = cartLines(cart, menu)

  const [category, setCategory] = useState<CategoryFilter>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('default')
  const [pageNumber, setPageNumber] = useState(1)
  const [productId, setProductId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogName>(() => (window.location.hash === '#manage' ? 'admin' : null))
  const [info, setInfo] = useState<InfoTopic | null>(null)
  const [announce, setAnnounce] = useState('')

  const found = useMemo(() => sortMenu(filterMenu(menu, { category, search }), sort), [menu, category, search, sort])
  const page = paginate(found, pageNumber, PER_PAGE)
  const popular = popularItem(menu, menuState.popularId)

  const changeQuery = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPageNumber(1) }

  const onQty = (id: string, qty: number) => {
    const before = cart[id] ?? 0
    const title = menu.find((i) => i.id === id)?.title ?? 'Позиция'
    if (before === 0 && qty > 0) setAnnounce(`«${title}» добавлено в корзину`)
    else if (qty <= 0) setAnnounce(`«${title}» удалено из корзины`)
    setCart((c) => setQty(pruneCart(c, menu), id, qty))
  }

  const goToMenu = () => {
    setDialog(null)
    requestAnimationFrame(() => document.getElementById('menu')?.scrollIntoView())
  }

  const onPage = (n: number) => {
    setPageNumber(n)
    document.getElementById('menu')?.scrollIntoView()
  }

  const submitOrder = (form: OrderForm) => {
    const orders = parseOrders(readStorage(KEYS.orders))
    const order = buildOrder(form, lines, orders.length, new Date())
    writeStorage(KEYS.orders, [...orders, order])
    setCart({})
    return order.number
  }

  useEffect(() => {
    if (dialog === 'admin') history.replaceState(null, '', '#manage')
    else if (window.location.hash === '#manage') history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [dialog])

  return (
    <div className="page" style={{ '--hero-image': `url(${heroImage})` } as CSSProperties}>
      <a className="skip-link" href="#menu">Перейти к меню</a>
      <Header 
        cartCount={cartCount(lines)} 
        onCart={() => setDialog('cart')} 
        onOrder={() => setDialog('order')} />
      <main>
        <Hero />
        <MenuSection
          page={page} 
          category={category} 
          search={search} 
          sort={sort} 
          cart={cart}
          onCategory={changeQuery(setCategory)}
          onSearch={changeQuery(setSearch)} 
          onSort={changeQuery(setSort)}
          onPage={onPage} 
          onOpen={setProductId} 
          onQty={onQty}
        />
        {popular && <PopularBanner item={popular} qty={cart[popular.id] ?? 0} onQty={onQty} onOpen={setProductId} />}
      </main>
      <Footer onInfo={setInfo} onManage={() => setDialog('admin')} />

      <ProductDialog
        item={menu.find((i) => i.id === productId)} 
        qty={productId ? cart[productId] ?? 0 : 0} 
        onQty={onQty}
        onCart={() => { setProductId(null); 
        setDialog('cart') }} 
        onClose={() => setProductId(null)}
      />
      <CartDrawer
        open={dialog === 'cart'} 
        lines={lines} 
        count={cartCount(lines)} 
        total={cartTotal(lines)} 
        onQty={onQty}
        onClose={() => setDialog(null)} 
        onCheckout={() => setDialog('order')} 
        onMenu={goToMenu}
      />
      <OrderDialog 
        open={dialog === 'order'} 
        lines={lines} 
        total={cartTotal(lines)} 
        onSubmit={submitOrder} 
        onClose={() => setDialog(null)} 
        onMenu={goToMenu} />
      <AdminDialog
        open={dialog === 'admin'} 
        menu={menu} 
        popularId={popular?.id ?? menuState.popularId} 
        onClose={() => setDialog(null)}
        onPrice={(id, price) => setMenuState((s) => updateItem(s, id, { price }))}
        onAvailable={(id, available) => setMenuState((s) => updateItem(s, id, { available }))}
        onPopular={(id) => setMenuState((s) => setPopular(s, id))}
        onRemove={(id) => setMenuState((s) => removeItem(s, id))}
        onAdd={(item) => setMenuState((s) => addItem(s, item))}
        onReset={() => setMenuState(EMPTY_STATE)}
      />
      <InfoDialog topic={info} onClose={() => setInfo(null)} />
      <p className="visually-hidden" role="status" aria-live="polite">{announce}</p>
    </div>
  )
}
