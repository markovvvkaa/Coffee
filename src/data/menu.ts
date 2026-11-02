import espresso from '../assets/menu/espresso.jpg'
import latte from '../assets/menu/latte.jpg'
import cappuccino from '../assets/menu/cappuccino.jpg'
import mocha from '../assets/menu/mocha.jpg'
import flatwhite from '../assets/menu/flatwhite.jpg'
import caramel from '../assets/menu/caramel.jpg'
import bananabread from '../assets/menu/bananabread.jpg'
import muffin from '../assets/menu/muffin.jpg'
import vanilla from '../assets/menu/vanilla.jpg'
import berry from '../assets/menu/berry.jpg'
import cheesecake from '../assets/menu/cheesecake.jpg'
import drinkStub from '../assets/menu/drink.jpg'
import dessertStub from '../assets/menu/dessert.jpg'

export const CATEGORIES = ['coffee', 'dessert'] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABEL: Record<Category, string> = { coffee: 'Кофе', dessert: 'Десерты' }
export const UNIT: Record<Category, string> = { coffee: 'мл', dessert: 'г' }
export const STUB_IMAGE: Record<Category, string> = { coffee: drinkStub, dessert: dessertStub }

export interface MenuItem {
  id: string
  title: string
  category: Category
  description: string
  composition: string
  amount: number
  price: number
  image: string
  available: boolean
  custom?: boolean
}

export const BASE_MENU: readonly MenuItem[] = [
  { id: 'espresso', title: 'Эспрессо', category: 'coffee', amount: 40, price: 140, image: espresso, available: true,
    description: 'Насыщенный шот из свежеобжаренной арабики с густой пенкой.',
    composition: 'Эспрессо из 100 % арабики (Бразилия, Колумбия).' },
  { id: 'latte', title: 'Латте', category: 'coffee', amount: 350, price: 230, image: latte, available: true,
    description: 'Мягкий кофе с большим количеством молока и нежной пенкой.',
    composition: 'Эспрессо, молоко 3,2 %, молочная пена.' },
  { id: 'cappuccino', title: 'Капучино', category: 'coffee', amount: 250, price: 210, image: cappuccino, available: true,
    description: 'Классика: эспрессо, горячее молоко и плотная молочная пена.',
    composition: 'Эспрессо, молоко 3,2 %, молочная пена.' },
  { id: 'mocha', title: 'Мокко', category: 'coffee', amount: 300, price: 260, image: mocha, available: true,
    description: 'Эспрессо с горячим шоколадом и молоком для любителей сладкого.',
    composition: 'Эспрессо, тёмный шоколад, молоко 3,2 %, молочная пена.' },
  { id: 'flatwhite', title: 'Флэт уайт', category: 'coffee', amount: 200, price: 220, image: flatwhite, available: true,
    description: 'Двойной эспрессо и тонкий слой бархатистого молока.',
    composition: 'Двойной эспрессо, молоко 3,2 %.' },
  { id: 'caramel-latte', title: 'Карамельный латте', category: 'coffee', amount: 350, price: 270, image: caramel, available: true,
    description: 'Латте с домашней карамелью и солёной ноткой – хит этого сезона.',
    composition: 'Эспрессо, молоко 3,2 %, карамельный соус собственного приготовления, морская соль.' },
  { id: 'banana-bread', title: 'Банановый хлеб', category: 'dessert', amount: 120, price: 180, image: bananabread, available: true,
    description: 'Влажный кекс из спелых бананов с грецким орехом.',
    composition: 'Бананы, пшеничная мука, сливочное масло, яйца, тростниковый сахар, грецкий орех.' },
  { id: 'chocolate-muffin', title: 'Шоколадный маффин', category: 'dessert', amount: 100, price: 160, image: muffin, available: true,
    description: 'Пышный маффин с какао и кусочками тёмного шоколада.',
    composition: 'Пшеничная мука, какао, тёмный шоколад 70 %, яйца, сливочное масло, сахар.' },
  { id: 'vanilla-cake', title: 'Ванильный кекс', category: 'dessert', amount: 110, price: 150, image: vanilla, available: true,
    description: 'Нежный кекс на сливочном масле с натуральной ванилью.',
    composition: 'Пшеничная мука, сливочное масло, яйца, сахар, стручок ванили, сахарная пудра.' },
  { id: 'berry-cake', title: 'Ягодный кекс', category: 'dessert', amount: 110, price: 170, image: berry, available: true,
    description: 'Кекс с клюквой и брусникой, присыпанный сахарной пудрой.',
    composition: 'Пшеничная мука, сливочное масло, яйца, сахар, клюква, брусника.' },
  { id: 'cheesecake', title: 'Шоколадный чизкейк', category: 'dessert', amount: 130, price: 240, image: cheesecake, available: true,
    description: 'Плотный сливочный чизкейк с тёмным шоколадом на песочной основе.',
    composition: 'Сливочный сыр, сливки 33 %, тёмный шоколад, яйца, песочное печенье, сливочное масло.' },
]

export const DEFAULT_POPULAR_ID = 'caramel-latte'
