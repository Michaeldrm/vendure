import { Ref, computed } from '@vue/composition-api';
import { UseUser, Context, FactoryParams, UseUserErrors, CustomQuery, sharedRef, Logger, mask, configureFactoryParams } from '@vue-storefront/core';

export interface UseUserFactoryParams<
  USER,
  UPDATE_USER_PARAMS,
  REGISTER_USER_PARAMS,
> extends FactoryParams {
  load: (context: Context, params?: { customQuery: CustomQuery }) => Promise<USER>;
  logOut: (context: Context, params: {currentUser: USER}) => Promise<void>;
  updateUser: (context: Context, params: {currentUser: USER; updatedUserData: UPDATE_USER_PARAMS; customQuery?: CustomQuery}) => Promise<USER>;
  register: (context: Context, params: REGISTER_USER_PARAMS & {customQuery?: CustomQuery}) => Promise<USER>;
  logIn: (context: Context, params: { username: string; password: string; customQuery?: CustomQuery }) => Promise<USER>;
  changePassword: (context: Context, params: {currentUser: USER; currentPassword: string; newPassword: string; customQuery?: CustomQuery}) => Promise<USER>;
  updateEmail: (context: Context, params: {currentUser: USER; updatedUserData: UPDATE_USER_PARAMS; customQuery?: CustomQuery}) => Promise<void>;
}

export type CustomUseUser<USER, UPDATE_USER_PARAMS> = UseUser<USER, UPDATE_USER_PARAMS> & { updateEmail }

export type CustomUseUserErrors = UseUserErrors & { updateEmail: null }

export const useUserFactory = <
USER,
UPDATE_USER_PARAMS,
REGISTER_USER_PARAMS extends { email: string; password: string },
>(
    factoryParams: UseUserFactoryParams<USER, UPDATE_USER_PARAMS, REGISTER_USER_PARAMS>
  ) => {
  return function useUser (): CustomUseUser<USER, UPDATE_USER_PARAMS> {
    const errorsFactory = (): CustomUseUserErrors => ({
      updateUser: null,
      register: null,
      login: null,
      logout: null,
      changePassword: null,
      load: null,
      updateEmail: null
    });

    const user: Ref<USER> = sharedRef(null, 'useUser-user');
    const loading: Ref<boolean> = sharedRef(false, 'useUser-loading');
    const isAuthenticated = computed(() => Boolean(user.value));
    const error: Ref<CustomUseUserErrors> = sharedRef(errorsFactory(), 'useUser-error');

    const _factoryParams = configureFactoryParams(factoryParams);

    const setUser = (newUser: USER) => {
      user.value = newUser;
      Logger.debug('useUserFactory.setUser', newUser);
    };

    const resetErrorValue = () => {
      error.value = errorsFactory();
    };

    const updateUser = async ({ user: providedUser, customQuery }) => {
      Logger.debug('useUserFactory.updateUser', providedUser);
      resetErrorValue();

      try {
        loading.value = true;
        user.value = await _factoryParams.updateUser({currentUser: user.value, updatedUserData: providedUser, customQuery});
        error.value.updateUser = null;
      } catch (err) {
        error.value.updateUser = err;
        Logger.error('useUser/updateUser', err);
      } finally {
        loading.value = false;
      }
    };

    const register = async ({ user: providedUser, customQuery }) => {
      Logger.debug('useUserFactory.register', providedUser);
      resetErrorValue();

      try {
        loading.value = true;
        // In Vendure the register will return boolean instead of customer so we cannot save it as user.
        await _factoryParams.register({...providedUser, customQuery});
        error.value.register = null;
      } catch (err) {
        error.value.register = err;
        Logger.error('useUser/register', err);
      } finally {
        loading.value = false;
      }
    };

    const login = async ({ user: providedUser, customQuery }) => {
      Logger.debug('useUserFactory.login', providedUser);
      resetErrorValue();

      try {
        loading.value = true;
        user.value = await _factoryParams.logIn({...providedUser, customQuery});
        error.value.login = null;
      } catch (err) {
        error.value.login = err;
        Logger.error('useUser/login', err);
      } finally {
        loading.value = false;
      }
    };

    const logout = async () => {
      Logger.debug('useUserFactory.logout');
      resetErrorValue();

      try {
        await _factoryParams.logOut({ currentUser: user.value });
        error.value.logout = null;
        user.value = null;
      } catch (err) {
        error.value.logout = err;
        Logger.error('useUser/logout', err);
      }
    };

    const changePassword = async (params) => {
      Logger.debug('useUserFactory.changePassword', { currentPassword: mask(params.current), newPassword: mask(params.new) });
      resetErrorValue();

      try {
        loading.value = true;
        user.value = await _factoryParams.changePassword({
          currentUser: user.value,
          currentPassword: params.currentPassword,
          newPassword: params.newPassword,
          customQuery: params.customQuery
        });
        error.value.changePassword = null;
      } catch (err) {
        error.value.changePassword = err;
        Logger.error('useUser/changePassword', err);
      } finally {
        loading.value = false;
      }
    };

    const load = async ({customQuery} = {customQuery: undefined}) => {
      Logger.debug('useUserFactory.load');
      resetErrorValue();

      try {
        loading.value = true;
        user.value = await _factoryParams.load({customQuery});
        error.value.load = null;
      } catch (err) {
        error.value.load = err;
        Logger.error('useUser/load', err);
      } finally {
        loading.value = false;
      }
    };

    const updateEmail = async ({ user: providedUser, customQuery }) => {
      Logger.debug('useUserFactory.updateEmail', providedUser);
      resetErrorValue();

      try {
        loading.value = true;
        await _factoryParams.updateEmail({currentUser: user.value, updatedUserData: providedUser, customQuery});
        error.value.updateEmail = null;
      } catch (err) {
        error.value.updateEmail = err;
        Logger.error('useUser/updateEmail', err);
      } finally {
        loading.value = false;
      }
    };

    return {
      setUser,
      user: computed(() => user.value),
      updateUser,
      register,
      login,
      logout,
      isAuthenticated,
      changePassword,
      updateEmail,
      load,
      loading: computed(() => loading.value),
      error: computed(() => error.value)
    };
  };
};
