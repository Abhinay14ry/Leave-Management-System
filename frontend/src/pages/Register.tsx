import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRegisterMutation } from '../store/api'
import { registerSchema, type RegisterFormData } from '../schemas/validation'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const [register, { isLoading, error }] = useRegisterMutation()
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'employee' },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data).unwrap()
      navigate('/login', { state: { registered: true } })
    } catch (err: any) {
      console.error('Registration failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">Leave Management System</h1>
        <p className="mt-2 text-center text-sm text-gray-600">Create your account</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && <div className="text-red-600 text-sm" role="alert">{(error as any).data?.detail || 'Unable to create account.'}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  id="first_name"
                  type="text"
                  {...registerField('first_name')}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  id="last_name"
                  type="text"
                  {...registerField('last_name')}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                {...registerField('username')}
                autoComplete="username"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...registerField('email')}
                autoComplete="email"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                {...registerField('role')}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-white ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
              </select>
              {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...registerField('password')}
                autoComplete="new-password"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="password_confirm"
                type="password"
                {...registerField('password_confirm')}
                autoComplete="new-password"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                  errors.password_confirm ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password_confirm && <p className="mt-1 text-xs text-red-600">{errors.password_confirm.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
