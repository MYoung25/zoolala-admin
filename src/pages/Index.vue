<template>
  <q-page class="row items-start justify-evenly q-ma-xl">
    <q-table
      class="col-9 full-width"
      title="Restaurants"
      :columns="columns"
      :loading="isLoading"
      :rows="restaurants"
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
    <div class="col-3 text-center">
      <p>This allows an administrator to choose which restaurants will show up on <a class="text-primary" href="https://zoolala.events">ZooLaLa.Events</a></p>
    </div>
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
    name: 'actions',
    label: 'Actions',
    align: 'center',
    field: () => '',
  }
]

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const $q = useQuasar()
    const isLoading = ref(true)
    const isDialogOpen = ref(false)
    const restaurants = ref<Restaurant[]>([])
    const newRestaurant = ref({
      name: '',
      food: '',
    })

    onMounted(async () => {
      try {
        const response = await api.get('/', {
          params: {
            type: 'restaurant'
          }
        })
        if (response && 'data' in response) {
          restaurants.value = response.data as Restaurant[]
        }
      } catch (e) {
        $q.notify({
          type: 'negative',
          message: 'Something went wrong'
        })
      }
      isLoading.value = false
    })

    function toggleDialog () {
      isDialogOpen.value = !isDialogOpen.value
      newRestaurant.value = {
        name: '',
        food: '',
      }
    }

    return {
      columns,
      isLoading,
      restaurants,
      isDialogOpen,
      newRestaurant,
      toggleDialog,
      async deleteRestaurant (row: Restaurant) {
        try {
          await api.delete('/', {
            headers: {
              'content-type': 'application/json',
            },
            data: {
              type: 'restaurant',
              name: row.name
            }
          })
          const response = await api.get('/', {
            params: {
              type: 'restaurant'
            }
          })
          if (response && 'data' in response) {
            restaurants.value = response.data as Restaurant[]
          }
        } catch (e) {
          $q.notify({
            type: 'negative',
            message: 'Something went wrong'
          })
        }
      },
      async addRestaurant () {
        if (newRestaurant.value.name === '' || newRestaurant.value.food === '') {
          return
        }
        isLoading.value = true
        try {
          await api.post('/', {
            type: 'restaurant',
            ...newRestaurant.value
          }, {
            headers: {
              'content-type': 'application/json',
            }
          })
          const response = await api.get('/', {
            params: {
              type: 'restaurant'
            }
          })
          if (response && 'data' in response) {
            restaurants.value = response.data as Restaurant[]
          }
        } catch (e: unknown) {
          $q.notify({
            type: 'negative',
            message: 'Something went wrong'
          })
        }
        toggleDialog()
        isLoading.value = false
      },
    }
  }
});
</script>
