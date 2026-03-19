'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface TestPlan {
  id: string
  name: string
  status: string
  startDate: Date | null
}

interface TestPlanSelectorProps {
  plans: TestPlan[]
  selectedPlanId?: string
}

export function TestPlanSelector({ plans, selectedPlanId }: TestPlanSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(planId: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (planId) {
      params.set('planId', planId)
    } else {
      params.delete('planId')
    }
    router.push(`/execution?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">Test Plan:</label>
      <select
        value={selectedPlanId ?? ''}
        onChange={e => handleChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[220px]"
      >
        <option value="">Latest Plan</option>
        {plans.map(plan => (
          <option key={plan.id} value={plan.id}>
            {plan.name}
          </option>
        ))}
      </select>
    </div>
  )
}
