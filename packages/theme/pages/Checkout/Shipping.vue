<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <SfHeading
      v-e2e="'shipping-heading'"
      :level="3"
      :title="$t('Shipping')"
      class="sf-heading--left sf-heading--no-underline title"
    />
    <form @submit.prevent="handleSubmit(handleFormSubmit)">
      <div class="form">
        <ValidationProvider
          name="firstName"
          rules="required|min:2"
          v-slot="{ errors }"
          slim
        >
          <SfInput
            v-e2e="'shipping-firstName'"
            v-model="form.firstName"
            :label="$t('First name')"
            name="firstName"
            class="form__element form__element--half"
            required
            :valid="!errors[0]"
            :errorMessage="errors[0]"
          />
        </ValidationProvider>
        <ValidationProvider
          name="lastName"
          rules="required|min:2"
          v-slot="{ errors }"
          slim
        >
          <SfInput
            v-e2e="'shipping-lastName'"
            v-model="form.lastName"
            :label="$t('Last name')"
            name="lastName"
            class="form__element form__element--half form__element--half-even"
            required
            :valid="!errors[0]"
            :errorMessage="errors[0]"
          />
        </ValidationProvider>
        <ValidationProvider
          name="streetName"
          rules="required|min:2"
          v-slot="{ errors }"
          slim
        >
          <SfInput
            v-e2e="'shipping-streetName'"
            v-model="form.streetName"
            :label="$t('Street name')"
            name="streetName"
            class="form__element form__element--half"
            required
            :valid="!errors[0]"
            :errorMessage="errors[0]"
          />
        </ValidationProvider>
        <ValidationProvider
          name="apartment"
          rules="required|min:2"
          v-slot="{ errors }"
          slim
        >
          <SfInput
            v-e2e="'shipping-apartment'"
            v-model="form.apartment"
            :label="$t('House_OR_Apartment_number')"
            name="apartment"
            class="form__element form__element--half form__element--half-even"
            required
            :valid="!errors[0]"
            :errorMessage="errors[0]"
          />
        </ValidationProvider>
        <ValidationProvider
          name="city"
          rules="required|min:2"
          v-slot="{ errors }"
          slim
        >
          <SfInput
            v-e2e="'shipping-city'"
            v-model="form.city"
            :label="$t('City')"
            name="city"
            class="form__element form__element--half"
            required
            :valid="!errors[0]"
            :errorMessage="errors[0]"
          />
        </ValidationProvider>
        <ValidationProvider
          name="state"
          slim
        >
          <SfInput
            v-e2e="'shipping-state'"
            v-model="form.state"
            :label="$t('State_OR_Province')"
            name="state"
            class="form__element form__element--half form__element--half-even"
          />
        </ValidationProvider>
        <ValidationProvider
          name="country"
          rules="required|min:2"
          v-slot="{ errors }"
          slim
        >
          <SfSelect
            v-e2e="'shipping-country'"
            v-model="form.country"
            :label="$t('Country')"
            name="country"
            class="form__element form__element--half form__select sf-select--underlined"
            required
            :valid="!errors[0]"
            :errorMessage="errors[0]"
          >
            <SfSelectOption
              v-for="countryOption in countries"
              :key="countryOption.key"
              :value="countryOption.key"
            >
              {{ countryOption.label }}
            </SfSelectOption>
          </SfSelect>
        </ValidationProvider>
        <ValidationProvider
          name="zipCode"
          rules="required|min:2"
          v-slot="{ errors }"
          slim
        >
          <SfInput
            v-e2e="'shipping-zipcode'"
            v-model="form.postalCode"
            :label="$t('Zip-code')"
            name="zipCode"
            class="form__element form__element--half form__element--half-even"
            required
            :valid="!errors[0]"
            :errorMessage="errors[0]"
          />
        </ValidationProvider>
        <ValidationProvider
          name="phone"
          rules="required|phone"
          v-slot="{ errors }"
          slim
        >
          <SfInput
            v-e2e="'shipping-phone'"
            v-model="form.phone"
            :label="$t('Phone number')"
            name="phone"
            class="form__element form__element--half"
            required
            :valid="!errors[0]"
            :errorMessage="errors[0]"
          />
        </ValidationProvider>
      </div>
      <div class="form">
        <div class="form__action">
          <SfButton
            v-e2e="'select-shipping'"
            v-if="!isFormSubmitted"
            :disabled="loading"
            class="form__action-button"
            type="submit"
          >
            {{ $t('Select shipping method') }}
          </SfButton>
        </div>
      </div>
      <VsfShippingProvider
        v-if="isFormSubmitted"
        @submit="$router.push('/checkout/billing')"
        @shippingMethodSelected="displayBillingButton"
      />
      <div class="form__action">
        <SfButton
          v-if="shouldDisplayButton"
          v-e2e="'continue-to-billing'"
          class="form__action-button"
          type="button"
          @click="$router.push(localePath({ name: 'billing' }))"
          :disabled="!shouldDisplayButton || loadingShippingProvider"
        >
          {{ $t('Continue to billing') }}
        </SfButton>
        </div>
    </form>
  </ValidationObserver>
</template>

<script>
import {
  SfHeading,
  SfInput,
  SfButton,
  SfSelect
} from '@storefront-ui/vue';
import { ref, onMounted } from '@vue/composition-api';
import { onSSR } from '@vue-storefront/core';
import { useShipping, useShippingProvider, useUserShipping } from '@vue-storefront/vendure';
import { required, min, digits } from 'vee-validate/dist/rules';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { mapAddressFormToOrderAddress, COUNTRIES, getDefaultAddress, mapAddressToAddressForm } from '~/helpers';
import '@/helpers';

extend('required', {
  ...required,
  message: 'This field is required'
});
extend('min', {
  ...min,
  message: 'The field should have at least {length} characters'
});
extend('digits', {
  ...digits,
  message: 'Please provide a valid phone number'
});

export default {
  name: 'Shipping',
  components: {
    SfHeading,
    SfInput,
    SfButton,
    SfSelect,
    ValidationProvider,
    ValidationObserver,
    VsfShippingProvider: () => import('~/components/Checkout/VsfShippingProvider')
  },
  setup () {
    const isFormSubmitted = ref(false);
    const { load, save, loading } = useShipping();
    const { loading: loadingShippingProvider } = useShippingProvider();
    const { shipping: userShipping, load: loadUserShipping } = useUserShipping();
    const shouldDisplayButton = ref(false);

    const form = ref({
      firstName: '',
      lastName: '',
      streetName: '',
      apartment: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      phone: null
    });

    const handleFormSubmit = async () => {
      const orderAddress = mapAddressFormToOrderAddress(form.value);
      await save({ shippingDetails: orderAddress });
      isFormSubmitted.value = true;
    };

    const displayBillingButton = async () => {
      shouldDisplayButton.value = true;
    };

    onSSR(async () => {
      await load();
    });

    onMounted(async () => {
      await loadUserShipping();
      const defaultAddress = getDefaultAddress(userShipping.value, 'shipping');
      const formAddress = mapAddressToAddressForm(defaultAddress);
      form.value = {
        firstName: formAddress.firstName,
        lastName: formAddress.lastName,
        streetName: formAddress.streetName,
        apartment: formAddress.streetNumber,
        city: formAddress.city,
        state: formAddress.state,
        country: formAddress.country,
        postalCode: formAddress.postalCode,
        phone: formAddress.phone
      };
    });

    return {
      loading,
      isFormSubmitted,
      form,
      countries: COUNTRIES,
      handleFormSubmit,
      loadingShippingProvider,
      displayBillingButton,
      shouldDisplayButton
    };
  }
};
</script>

<style lang="scss" scoped>
.form {
  --button-width: 100%;
  &__select {
    display: flex;
    align-items: center;
    --select-option-font-size: var(--font-size--lg);
    ::v-deep .sf-select__dropdown {
      font-size: var(--font-size--lg);
      margin: 0;
      color: var(--c-text);
      font-family: var(--font-family--secondary);
      font-weight: var(--font-weight--normal);
    }
  }
  @include for-desktop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    --button-width: auto;
  }
  &__element {
    margin: 0 0 var(--spacer-xl) 0;
    @include for-desktop {
      flex: 0 0 100%;
    }
    &--half {
      @include for-desktop {
        flex: 1 1 50%;
      }
      &-even {
        @include for-desktop {
          padding: 0 0 0 var(--spacer-xl);
        }
      }
    }
  }
  &__action {
    @include for-desktop {
      flex: 0 0 100%;
      display: flex;
    }
  }
  &__action-button {
    &--secondary {
      @include for-desktop {
        order: -1;
        text-align: left;
      }
    }
    &--add-address {
      width: 100%;
      margin: 0;
      @include for-desktop {
        margin: 0 0 var(--spacer-lg) 0;
        width: auto;
      }
    }
  }
  &__back-button {
    margin: var(--spacer-xl) 0 var(--spacer-sm);
    &:hover {
      color:  var(--c-white);
    }
    @include for-desktop {
      margin: 0 var(--spacer-xl) 0 0;
    }
  }
}

.shipping {
  &__label {
    display: flex;
    justify-content: space-between;
  }
  &__description {
    --radio-description-margin: 0;
    --radio-description-font-size: var(--font-xs);
  }
}

.title {
  margin: var(--spacer-xl) 0 var(--spacer-base) 0;
}
</style>
