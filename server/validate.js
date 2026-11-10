// Проверка позиции меню на сервере (те же правила, что и в форме админ-панели).
export const CATEGORIES = ['coffee', 'dessert']

const isInt = (v) => /^\d+$/.test(String(v ?? '').trim())

/**
 * Проверить и привести к нужным типам данные позиции.
 * otherTitles – названия других позиций (для проверки уникальности).
 * Возвращает { errors, value }; errors – объект «поле: сообщение».
 */
export function validateItem(input, otherTitles) {
  const errors = {}
  const title = String(input.title ?? '').trim()
  if (!title) errors.title = 'Укажите название'
  else if (title.length < 2 || title.length > 40) errors.title = 'От 2 до 40 символов'
  else if (otherTitles.some((t) => t.toLowerCase() === title.toLowerCase())) errors.title = 'Такая позиция уже есть'

  const category = String(input.category ?? '')
  if (!CATEGORIES.includes(category)) errors.category = 'Выберите категорию'

  if (!isInt(input.price)) errors.price = 'Цена – целое число'
  else if (Number(input.price) < 50 || Number(input.price) > 5000) errors.price = 'От 50 до 5000 ₽'

  if (!isInt(input.amount)) errors.amount = 'Укажите целое число'
  else if (Number(input.amount) < 20 || Number(input.amount) > 1000) errors.amount = 'От 20 до 1000'

  const description = String(input.description ?? '').trim()
  if (description.length < 10) errors.description = 'Не менее 10 символов'
  else if (description.length > 120) errors.description = 'Не более 120 символов'

  const composition = String(input.composition ?? '').trim()
  if (composition.length > 300) errors.composition = 'Не более 300 символов'

  const available = input.available === true || input.available === 'true'

  return {
    errors,
    value: { title, category, price: Number(input.price), amount: Number(input.amount), description, composition, available },
  }
}
