import { useMemo, useState, type CSSProperties } from 'react'
import heroImage from './assets/hero.jpg'
import { filterMenu, paginate, popularItem, sortMenu, type CategoryFilter, type SortOrder } from './utils/catalog'
import { cartCount, cartLines, cartTotal, parseCart, pruneCart, setQty, type Cart } from './utils/cart'
import { buildOrder, parseOrders } from './utils/orders'
import type { OrderForm } from './utils/validation'
import { readStorage, useStoredState, writeStorage } from './hooks/useStoredState'
import { useMenu } from './hooks/useMenu'
import Header from './components/Header'
import Hero from './components/Hero'
import MenuSection from './components/MenuSection'
import PopularBanner from './components/PopularBanner'
import Footer, { type InfoTopic } from './components/Footer'
import ProductDialog from './components/ProductDialog'
import CartDrawer from './components/CartDrawer'
import OrderDialog from './components/OrderDialog'
import InfoDialog from './components/InfoDialog'

const PER_PAGE = 6
const KEYS = { cart: 'coffee:cart', orders: 'coffee:orders' }
type DialogName = 'cart' | 'order' | null

export default function App() {
  // меню и позиция для баннера приходят с сервера (управляются в админ-панели admin.html)
  const { items: menu, popularId, source } = useMenu()
  const [storedCart, setCart] = useStoredState<Cart>(KEYS.cart, parseCart)
  const cart = useMemo(() => pruneCart(storedCart, menu), [storedCart, menu])
  const lines = cartLines(cart, menu)

  const [category, setCategory] = useState<CategoryFilter>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('default')
  const [pageNumber, setPageNumber] = useState(1)
  const [productId, setProductId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogName>(null)
  const [info, setInfo] = useState<InfoTopic | null>(null)
  const [announce, setAnnounce] = useState('')

  const found = useMemo(() => sortMenu(filterMenu(menu, { category, search }), sort), [menu, category, search, sort])
  const page = paginate(found, pageNumber, PER_PAGE)
  const popular = popularItem(menu, popularId)

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
          loading={source === 'loading'}
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
      <Footer onInfo={setInfo} />

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
      <InfoDialog topic={info} onClose={() => setInfo(null)} />
      <p className="visually-hidden" role="status" aria-live="polite">{announce}</p>
    </div>
  )
}
