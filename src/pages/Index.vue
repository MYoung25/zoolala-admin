<template>
  <q-page class="row items-start justify-evenly q-ma-xl">
    <q-table
      class="col-12"
      title="Restaurants"
      :columns="columns"
      :visible-columns="['name', 'food']"
      :loading="isLoading"
    >
      <template #top-right>
        <q-btn
          label="Add Restaurant"
          color="positive"
          @click="toggleDialog"
        />
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <div>
            <q-btn
              label="Delete"
              color="negative"
              :loading="isLoading"
              @click="() => {deleteRestaurant(props.row)}"
            />
          </div>
          <div>
            {{ props.row.details }}
          </div>
        </q-td>
      </template>
    </q-table>
    <q-dialog
      v-model="isDialogOpen"
    >
      <q-card>
        <q-card-section>
          <div class="text-h5">Add Restaurant</div>
          <q-input v-model="newRestaurant.name" label="Name" filled class="q-mb-md" />
          <q-input v-model="newRestaurant.food" label="Food" filled />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Cancel"
            flat
            :loading="isLoading"
            @click="toggleDialog"
          />
          <q-btn
            label="Save"
            color="positive"
            :loading="isLoading"
            @click="addRestaurant"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

interface Restaurant {
  name: string
  food: string
}

const columns = [
  {
    name: 'name',
    label: 'Name',
    align: 'left',
    field: (row: Restaurant) => row.name,
  },
  {
    name: 'food',
    label: 'Food',
    align: 'left',
    field: (row: Restaurant) => row.food,
  },
  {
    name: 'action',
    label: 'Actions',
    align: 'center',
    field: () => undefined,
  }
]

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const $q = useQuasar()
    const isLoading = ref(true)
    const isDialogOpen = ref(false)
    const restaurants = ref([])
    const newRestaurant = ref({
      name: '',
      food: '',
    })

    onMounted(async () => {
      try {
        await api.get('/api', {
          params: {
            type: 'restaurant'
          }
        })
      } catch (e) {
        $q.notify({
          type: 'negative',
          message: 'Something went wrong'
        })
      }
      isLoading.value = false
    })

    return {
      columns,
      isLoading,
      restaurants,
      isDialogOpen,
      newRestaurant,
      deleteRestaurant (row: unknown) {
        console.log(row)
      },
      toggleDialog () {
        isDialogOpen.value = !isDialogOpen.value
        newRestaurant.value = {
          name: '',
          food: '',
        }
      },
      async addRestaurant () {
        isLoading.value = true
        try {
          await api.post('/api', {
            type: 'restaurant',
            ...newRestaurant.value
          }, {
            headers: {
              'content-type': 'application/json',
            }
          })
          const data = await api.get('/api')
          console.log(data)
        } catch (e: unknown) {
          $q.notify({
            type: 'negative',
            message: 'Something went wrong'
          })
        }
        isLoading.value = false
      },
    }
  }
});
</script>
