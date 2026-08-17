<template>
  <div class="flex overflow-x-auto h-full">
    <Draggable
      v-if="columns"
      :list="columns"
      item-key="column"
      :delay="isTouchScreenDevice() ? 200 : 0"
      class="flex sm:mx-2.5 mx-2 pb-3.5"
      @end="updateColumn"
    >
      <template #item="{ element: column }">
        <div
          v-if="!column.column.delete"
          class="flex flex-col gap-2.5 hover:bg-surface-gray-2 rounded-lg p-2.5 transition-[width] duration-200"
          :class="column.column.all_count ? 'min-w-72 w-72' : 'min-w-52 w-52'"
        >
          <div class="flex gap-2 items-center group justify-between">
            <div class="flex items-center text-base">
              <Popover>
                <template #target="{ togglePopover }">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="hover:!bg-surface-gray-2"
                    @click="togglePopover"
                  >
                    <IndicatorIcon :class="parseColor(column.column.color)" />
                  </Button>
                </template>
                <template #body>
                  <div
                    class="flex flex-col gap-3 px-3 py-2.5 min-w-40 rounded-lg bg-surface-elevation-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div class="flex gap-1">
                      <Button
                        v-for="color in colors"
                        :key="color"
                        variant="ghost"
                        @click="() => (column.column.color = color)"
                      >
                        <IndicatorIcon :class="parseColor(color)" />
                      </Button>
                    </div>
                    <div class="flex flex-row-reverse">
                      <Button
                        variant="solid"
                        :label="__('Apply')"
                        @click="updateColumn"
                      />
                    </div>
                  </div>
                </template>
              </Popover>
              <div class="flex flex-col"><div class="text-ink-gray-9">{{ column.column.name }}</div><div class="text-xs text-ink-gray-5">{{ column.column.all_count }} thương vụ · {{ columnTotal(column) }}</div></div>
            </div>
            <div class="flex">
              <Dropdown :options="actions(column)">
                <template #default>
                  <Button
                    class="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity"
                    icon="lucide-more-horizontal"
                    variant="ghost"
                  />
                </template>
              </Dropdown>
              <Button
                icon="lucide-plus"
                variant="ghost"
                @click="options.onNewClick(column)"
              />
            </div>
          </div>
          <div class="overflow-y-auto flex flex-col gap-2 h-full">
            <Draggable
              :list="column.data"
              group="fields"
              item-key="name"
              class="flex flex-col gap-3.5 flex-1"
              :delay="isTouchScreenDevice() ? 200 : 0"
              :data-column="column.column.name"
              @end="updateColumn"
            >
              <template #item="{ element: fields }">
                <component
                  :is="options.getRoute ? 'router-link' : 'div'"
                  class="pt-3 px-3.5 pb-2.5 rounded-lg border bg-surface-base text-base flex flex-col text-ink-gray-9"
                  :style="cardStyle(fields)"
                  :data-name="fields.name"
                  v-bind="{
                    to: options.getRoute ? options.getRoute(fields) : undefined,
                    onClick: options.onClick
                      ? () => options.onClick(fields)
                      : undefined,
                  }"
                >
                  <slot
                    name="title"
                    v-bind="{ fields, titleField, itemName: fields.name }"
                  >
                    <div class="h-5 flex items-center">
                      <div v-if="fields[titleField]">
                        {{ fields[titleField] }}
                      </div>
                      <div v-else class="text-ink-gray-4">
                        {{ __('No Title') }}
                      </div>
                    </div>
                  </slot>
                  <div class="border-b h-px my-2.5" />

                  <div class="flex flex-col gap-3.5">
                    <template v-for="value in column.fields.filter((v) => !['creation','modified','_user_tags'].includes(v))" :key="value">
                      <!-- Bọc NGOÀI slot: Deals.vue có override #fields nên phần
                           fallback bên trong không chạy, đặt class ở trong là vô ích. -->
                      <div :class="laTruongTien(value) ? 'ntv-tien' : ''">
                        <slot
                          name="fields"
                          v-bind="{
                            fields,
                            fieldName: value,
                            itemName: fields.name,
                          }"
                        >
                          <div v-if="fields[value] && !['creation','modified','_user_tags'].includes(value)" class="truncate">
                            {{ fields[value] }}
                          </div>
                        </slot>
                      </div>
                    </template>
                  </div>
                  <div v-if="cardAge(fields) !== null || cardTags(fields).length" class="flex gap-1.5 flex-wrap items-center mt-2"><span v-if="cardAge(fields) !== null" :style="ageStyle(fields)" class="text-xs px-1.5 py-0.5 rounded">{{ cardAge(fields) }} ngày</span><span v-for="t in cardTags(fields)" :key="t" class="text-xs px-1.5 py-0.5 rounded bg-surface-gray-3 text-ink-gray-7">{{ t }}</span></div><div class="border-b h-px mt-2.5 mb-2" />
                  <slot name="actions" v-bind="{ itemName: fields.name }">
                    <div class="flex gap-2 items-center justify-between">
                      <div></div>
                      <Button
                        icon="lucide-plus"
                        variant="ghost"
                        @click.stop.prevent
                      />
                    </div>
                  </slot>
                </component>
              </template>
            </Draggable>
            <div
              v-if="column.column.count < column.column.all_count"
              class="flex items-center justify-center"
            >
              <Button
                :label="__('Load More')"
                @click="emit('loadMore', column.column.name)"
              />
            </div>
          </div>
        </div>
      </template>
    </Draggable>
    <div class="shrink-0 min-w-64">
      <Autocomplete
        value=""
        :options="deletedColumns"
        @change="(e) => addColumn(e)"
      >
        <template #target="{ togglePopover }">
          <Button
            class="w-full mt-2.5 mb-1 mr-5"
            :label="__('Add Column')"
            iconLeft="plus"
            @click="togglePopover()"
          />
        </template>
        <template #footer>
          <Button
            class="w-full"
            :label="__('Reload Columns')"
            :iconLeft="RefreshIcon"
            @click="updateColumn(null, true)"
          />
        </template>
      </Autocomplete>
    </div>
  </div>
</template>
<script setup>
import RefreshIcon from '@/components/Icons/RefreshIcon.vue'
import Autocomplete from '@/components/frappe-ui/Autocomplete.vue'
import IndicatorIcon from '@/components/Icons/IndicatorIcon.vue'
import { isTouchScreenDevice, colors, parseColor } from '@/utils'
import Draggable from 'vuedraggable'
import { Dropdown, Popover } from 'frappe-ui'
import { computed } from 'vue'

defineProps({
  options: {
    type: Object,
    default: () => ({
      getRoute: null,
      onClick: null,
      onNewClick: null,
    }),
  },
})

const emit = defineEmits(['update', 'loadMore'])

const kanban = defineModel({ type: Object })

const titleField = computed(() => {
  return kanban.value?.data?.title_field
})

const columns = computed(() => {
  if (!kanban.value?.data?.data || kanban.value.data.view_type != 'kanban')
    return []
  let _columns = kanban.value.data.data

  let has_color = _columns.some((column) => column.column?.color)
  if (!has_color) {
    _columns.forEach((column, i) => {
      column.column['color'] = colors[i % colors.length]
    })
  }
  return _columns
})

const deletedColumns = computed(() => {
  const _columns = kanban.value?.data?.kanban_columns || []
  return _columns
    ?.filter((col) => col['delete'])
    .map((col) => {
      return { label: col.name, value: col.name }
    })
})

function actions(column) {
  return [
    {
      group: __('Options'),
      hideLabel: true,
      items: [
        {
          label: __('Delete'),
          icon: 'trash-2',
          onClick: () => {
            column.column['delete'] = true
            updateColumn()
          },
        },
      ],
    },
  ]
}

function addColumn(e) {
  let column = columns.value.find((col) => col.column.name == e.value)
  column.column['delete'] = false
  columns.value.splice(columns.value.indexOf(column), 1)
  columns.value.push(column)
  updateColumn()
}

function updateColumn(d, fetchNewColumns = false) {
  let toColumn = d?.to?.dataset.column
  let fromColumn = d?.from?.dataset.column
  let itemName = d?.item?.dataset.name

  let _columns = []
  columns.value.forEach((col) => {
    col.column['order'] = col.data.map((d) => d.name)
    if (col.column.page_length) {
      delete col.column.page_length
    }
    _columns.push(col.column)
  })

  let data = { kanban_columns: _columns, fetchNewColumns }

  if (toColumn != fromColumn) {
    data = { item: itemName, to: toColumn, kanban_columns: _columns }
  }

  emit('update', data)
}

function columnTotal(column) {
  const sum = (column.data || []).reduce((t, d) => t + (parseFloat(d.deal_value) || 0), 0)
  return sum ? 'đ' + Math.round(sum).toLocaleString('vi-VN') : 'đ0'
}
function cardAge(fields) {
  const c = fields.modified || fields.creation
  if (!c) return null
  const days = Math.floor((Date.now() - new Date(String(c).replace(' ', 'T')).getTime()) / 86400000)
  return days >= 0 ? days : null
}
function cardTags(fields) {
  const t = fields._user_tags
  if (!t) return []
  return String(t).split(',').map((x) => x.trim()).filter(Boolean)
}

function ageStyle(fields) {
  const d = cardAge(fields)
  if (d === null) return {}
  if (d >= 7) return { background: '#fee2e2', color: '#b91c1c' }
  if (d >= 3) return { background: '#fef3c7', color: '#b45309' }
  /* #6b7280 trên nền #eef0f2 chỉ được 4.23, hụt chuẩn AA 4.5 — đậm thêm một nấc */
  return { background: '#eef0f2', color: '#4b5563' }
}

/* Cả thẻ đổi nền theo độ trễ, không chỉ mỗi cái huy hiệu.
   Lướt mắt qua cột là thấy ngay vùng nào đang nguội, khỏi phải đọc từng con số.

   Ngưỡng CAO HƠN badge có chủ ý (badge 3/7, nền 7/14): deal đại lý thường kéo
   hàng tuần, lấy ngưỡng badge mà nhuộm nền thì 100% thẻ đều có màu — đo thật trên
   8 thẻ ngày 08/08 thấy nhuộm đủ 8/8, tức là tín hiệu bão hoà và mất tác dụng.
   Badge lo cảnh báo sớm, nền chỉ hét khi thẻ thật sự nguội. */
function cardStyle(fields) {
  const d = cardAge(fields)
  /* Thẻ để TRẮNG trên nền kem của cột, không để kem trên kem — thẻ có nổi thành
     khối riêng thì mắt mới đếm được nhanh có bao nhiêu việc trong cột. */
  if (d === null) return { background: '#fff' }
  if (d >= 14) return { background: '#fef2f2', borderColor: '#fca5a5' }
  if (d >= 7) return { background: '#fffbeb', borderColor: '#fcd34d' }
  return { background: '#fff' }
}

/* Trường tiền phải nổi hơn các trường còn lại: quét dọc một cột, thứ người ta tìm
   là con số, không phải số điện thoại. Nhận diện theo TÊN trường chứ không theo
   thứ tự, để anh đổi thứ tự cột trong Cài đặt kanban thì vẫn đúng. */
function laTruongTien(ten) {
  return /value|amount|revenue|price|total|gia_tri|tien/i.test(String(ten))
}
</script>
