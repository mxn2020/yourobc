// src/features/yourobc/statistics/pages/OperatingCostsPage.tsx

import { FC, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import {
  Building2,
  Users,
  ShoppingCart,
  Plus,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { KPICard } from '../components/KPICard'
import {
  useOperatingCostsSummary,
  useEmployeeCosts,
  useOfficeCosts,
  useMiscExpenses,
  usePendingExpenseApprovals,
} from '../hooks/useStatistics'
import { formatCurrency, formatDate } from '../utils/formatters'

export const OperatingCostsPage: FC = () => {
  const currentDate = new Date()
  const [selectedTab, setSelectedTab] = useState('employee')

  // Calculate current month period
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime()
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59
  ).getTime()

  // Queries
  const { data: costsSummary, isLoading: costsSummaryLoading } = useOperatingCostsSummary(startOfMonth, endOfMonth)
  const { data: employeeCosts, isLoading: employeeCostsLoading } = useEmployeeCosts()
  const { data: officeCosts, isLoading: officeCostsLoading } = useOfficeCosts()
  const { data: miscExpenses, isLoading: miscExpensesLoading } = useMiscExpenses()
  const { data: pendingApprovals, isLoading: pendingApprovalsLoading } = usePendingExpenseApprovals()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operating Costs</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee costs, office expenses, and miscellaneous spending
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingApprovals && pendingApprovals.length > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              {pendingApprovals.length} Pending Approvals
            </Badge>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total Operating Costs"
          value={formatCurrency(costsSummary?.totalOperatingCosts || 0)}
          subtitle="This month"
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
        />

        <KPICard
          title="Employee Costs"
          value={formatCurrency(costsSummary?.employeeCosts.total || 0)}
          subtitle={`${costsSummary?.employeeCosts.employeeCount || 0} employees`}
          icon={<Users className="h-5 w-5 text-blue-600" />}
        />

        <KPICard
          title="Office Costs"
          value={formatCurrency(costsSummary?.officeCosts.total || 0)}
          subtitle={`${costsSummary?.officeCosts.itemCount || 0} items`}
          icon={<Building2 className="h-5 w-5 text-green-600" />}
        />

        <KPICard
          title="Misc Expenses"
          value={formatCurrency(costsSummary?.miscExpenses.total || 0)}
          subtitle={`${costsSummary?.miscExpenses.expenseCount || 0} expenses`}
          icon={<ShoppingCart className="h-5 w-5 text-orange-600" />}
        />
      </div>

      {/* Tabs for Different Cost Types */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employee">
            <Users className="h-4 w-4 mr-2" />
            Employee Costs
          </TabsTrigger>
          <TabsTrigger value="office">
            <Building2 className="h-4 w-4 mr-2" />
            Office Costs
          </TabsTrigger>
          <TabsTrigger value="misc">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Misc Expenses
            {pendingApprovals && pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Employee Costs Tab */}
        <TabsContent value="employee" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Employee Costs</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee Cost
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Employee / Position</th>
                    <th className="text-left py-3 px-4">Department</th>
                    <th className="text-right py-3 px-4">Monthly Salary</th>
                    <th className="text-right py-3 px-4">Benefits</th>
                    <th className="text-right py-3 px-4">Bonuses (Annual)</th>
                    <th className="text-right py-3 px-4">Total Monthly</th>
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeCosts?.map((cost) => {
                    const totalMonthly =
                      cost.monthlySalary.amount +
                      (cost.benefits?.amount || 0) +
                      (cost.bonuses?.amount || 0) / 12 +
                      (cost.otherCosts?.amount || 0)

                    return (
                      <tr key={cost._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">
                              {cost.employeeName || cost.position}
                            </p>
                            {cost.employeeName && (
                              <p className="text-sm text-muted-foreground">{cost.position}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {cost.department && (
                            <Badge variant="outline">{cost.department}</Badge>
                          )}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(cost.monthlySalary.amount, cost.monthlySalary.currency)}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {cost.benefits
                            ? formatCurrency(cost.benefits.amount, cost.benefits.currency)
                            : '-'}
                        </td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {cost.bonuses
                            ? formatCurrency(cost.bonuses.amount, cost.bonuses.currency)
                            : '-'}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(totalMonthly, cost.monthlySalary.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p>{formatDate(cost.startDate)}</p>
                            {cost.endDate ? (
                              <p className="text-muted-foreground">to {formatDate(cost.endDate)}</p>
                            ) : (
                              <Badge variant="success" className="mt-1">
                                Active
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Office Costs Tab */}
        <TabsContent value="office" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Office Costs</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Office Cost
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Frequency</th>
                    <th className="text-left py-3 px-4">Vendor</th>
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {officeCosts?.map((cost) => (
                    <tr key={cost._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <Badge variant="outline">{cost.category}</Badge>
                      </td>
                      <td className="py-3 px-4">{cost.description}</td>
                      <td className="text-right py-3 px-4 font-semibold">
                        {formatCurrency(cost.amount.amount, cost.amount.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge>
                          {cost.frequency === 'one_time'
                            ? 'One-time'
                            : cost.frequency === 'monthly'
                            ? 'Monthly'
                            : cost.frequency === 'quarterly'
                            ? 'Quarterly'
                            : 'Yearly'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {cost.vendor || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p>{formatDate(cost.date)}</p>
                          {cost.endDate && cost.frequency !== 'one_time' && (
                            <p className="text-muted-foreground">to {formatDate(cost.endDate)}</p>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Misc Expenses Tab */}
        <TabsContent value="misc" className="space-y-4">
          {/* Pending Approvals */}
          {pendingApprovals && pendingApprovals.length > 0 && (
            <Card className="p-6 border-orange-200 bg-orange-50">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-orange-900">
                  Pending Approvals ({pendingApprovals.length})
                </h2>
              </div>

              <div className="space-y-3">
                {pendingApprovals.map((expense) => (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{expense.category}</Badge>
                        {expense.employeeName && (
                          <span className="text-sm text-muted-foreground">
                            by {expense.employeeName}
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-semibold text-lg">
                        {formatCurrency(expense.amount.amount, expense.amount.currency)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Miscellaneous Expenses</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Employee</th>
                    <th className="text-left py-3 px-4">Vendor</th>
                    <th className="text-center py-3 px-4">Status</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {miscExpenses?.map((expense) => (
                    <tr key={expense._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <Badge variant="outline">{expense.category}</Badge>
                      </td>
                      <td className="py-3 px-4">{expense.description}</td>
                      <td className="text-right py-3 px-4 font-semibold">
                        {formatCurrency(expense.amount.amount, expense.amount.currency)}
                      </td>
                      <td className="py-3 px-4">{formatDate(expense.date)}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {expense.relatedEmployeeId ? 'Employee Name' : '-'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {expense.vendor || '-'}
                      </td>
                      <td className="text-center py-3 px-4">
                        {expense.approved ? (
                          <Badge variant="success">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
