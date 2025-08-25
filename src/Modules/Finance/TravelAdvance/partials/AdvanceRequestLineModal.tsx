import React, { useEffect, useMemo } from 'react';
import {
  Form,
  Row,
  Col,
  Select,
  Button,
  Modal,
  Typography,
  InputNumber,
  Skeleton,
  notification,
} from 'antd';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import {
  fetchDonorsList,
  fetchJobsList,
  selectCommonSetupStatus,
  selectDonorsList,
  selectJobsList,
} from '../../../../features/common/commonSetups';
import type {
  DimensionValues,
  ExpenditureTypes,
  JobPlanningLines,
  PaymentData,
  PaymentLinesData,
} from '../../../../types/PaymentData';
import { formatCurrencyUSD } from '../../../../utils/currencyFormmatter';
import { selectSubmitImprestLine, submitImprestLine } from '../../../../features/finance/advanceRequisition';
import { fetchImprestLines } from '../../../../features/finance/commonRequest';
import { jwtDecode } from 'jwt-decode';

const { Option } = Select;

interface RequestLineModalProps {
  visible: boolean;
  onClose: () => void;
  listofExpenditureTypes: ExpenditureTypes[];
  listOfActivities: JobPlanningLines[];
  listofProjectCodes: DimensionValues[];
  initialLine?: PaymentLinesData;
  documentDetails?: PaymentData | null;
}

interface MyPayload {
  staffNo?: string;
  gender?: string;
  given_name?: string;
}

const AdvanceRequestLineModal: React.FC<RequestLineModalProps> = ({
  visible,
  onClose,
  listofExpenditureTypes,
  listOfActivities,
  listofProjectCodes,
  initialLine,
  documentDetails,
}) => {
  const dispatch = useAppDispatch();
  const docNo = new URLSearchParams(window.location.search).get('DocumentNo');

  const donorsList = useAppSelector(selectDonorsList);
  const jobsList = useAppSelector(selectJobsList);
  const error = useAppSelector((state) => state.commonSetup.error);
  const { status: lineSubmitStatus, error: lineSubmitError } = useAppSelector(selectSubmitImprestLine);
  const [api, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();

  // Initialize or reset form values
  useEffect(() => {
    if (initialLine) {
      form.setFieldsValue({
        dailyRate: initialLine.dailyRate,
        noOfDays: initialLine.noOfDays,
        lineAmount: initialLine.lineAmount,
        projectCode: initialLine.department,
        donorCode: initialLine.projectCode,
        project: initialLine.project,
        projectActivity: initialLine.taskNo,
        expenditureType: initialLine.expenditureType,
      });
    } else {
      form.resetFields();
    }
  }, [initialLine, form]);

  // Fetch donors and projects on mount
  useEffect(() => {
    dispatch(fetchDonorsList());
    dispatch(fetchJobsList());
  }, [dispatch]);

  // Decode JWT for permissions
  const decodedToken = useMemo<MyPayload | null>(() => {
    try {
      const root = localStorage.getItem('persist:root');
      if (!root) return null;
      const parsedRoot = JSON.parse(root);
      const parsedAuth = JSON.parse(parsedRoot.auth ?? '{}');
      return parsedAuth?.token ? jwtDecode<MyPayload>(parsedAuth.token) : null;
    } catch {
      return null;
    }
  }, []);

  const canViewBudget = useMemo(() => decodedToken?.given_name?.toLowerCase() === 'true', [decodedToken]);

  const selectedProjectCode = Form.useWatch('project', form);
  const selectedActivityId = Form.useWatch('projectActivity', form);

  // Filter activities based on selected project
  const filteredActivities = useMemo(() => (
    selectedProjectCode
      ? listOfActivities.filter(a => a.jobNo === selectedProjectCode && a.planningLineDescription)
      : []
  ), [selectedProjectCode, listOfActivities]);

  // Update planned activity budget when activity changes
  useEffect(() => {
    if (!selectedActivityId) return;
    const activity = filteredActivities.find(a => a.lineNo === selectedActivityId);
    if (activity) form.setFieldsValue({ plannedActivityBudget: activity.budgetAmount ?? undefined });
  }, [selectedActivityId, filteredActivities, form]);

  // Compute line amount automatically
  const amount = Form.useWatch('dailyRate', form);
  const noOfDays = Form.useWatch('noOfDays', form);
  useEffect(() => {
    const computed = (amount || 0) * (noOfDays || 0);
    if (computed !== form.getFieldValue('lineAmount')) form.setFieldsValue({ lineAmount: computed });
  }, [amount, noOfDays, form]);

  // Handle form submission
 // Handle form submission with error handling
const handleSubmit = async (values: any) => {
  const payload = { ...values, documentNo: docNo, lineNo: initialLine?.lineNo ?? 0 };

  try {
    const res = await dispatch(submitImprestLine(payload));

    if (submitImprestLine.fulfilled.match(res)) {
      api.success({
        message: 'Success',
        description: res.payload?.description || 'Request Line added successfully',
        duration: 3,
        onClose() {
          if (docNo) {
            dispatch(fetchImprestLines({ documentNo: docNo }));
          }
          onClose();
        },
      });
    } 
    else if (submitImprestLine.rejected.match(res)) {
      api.error({
        message: 'Submission Failed',
        description: res.payload?.message || 'Unable to submit request line',
        duration: 5,
      });
    }
  } catch (err: any) {
    api.error({
      message: 'Unexpected Error',
      description: err?.message || 'Something went wrong while submitting the request line.',
      duration: 5,
    });
  }
};

  return (
    <>
      {contextHolder}
      <Modal
        open={visible}
        onCancel={onClose}
        title={`${initialLine ? 'Edit' : 'Add'} Request Line`}
        footer={null}
        destroyOnClose
        width={800}
        style={{ top: 20 }}
      >
        {lineSubmitStatus === 'pending' ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : lineSubmitError ? (
          <Typography.Text type="danger">{lineSubmitError}</Typography.Text>
        ) : (
        <>
        {contextHolder}
          <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off" initialValues={{ requiredDate: moment() }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Donor Code" name="donorCode" rules={[{ required: true }]}>
                  <Select showSearch placeholder="Select Donor Code" optionFilterProp="children" filterSort={(a, b) => String(a?.children).toLowerCase().localeCompare(String(b?.children).toLowerCase())}>
                    <Option value="">-- All Donors --</Option>
                    {donorsList.map(donor => <Option key={donor.code} value={donor.code}>{donor.description}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Project Code" name="projectCode" rules={[{ required: true }]}>
                  <Select showSearch placeholder="Select Project Code" optionFilterProp="children" filterSort={(a, b) => String(a?.children).toLowerCase().localeCompare(String(b?.children).toLowerCase())}>
                    <Option value="">-- All Projects --</Option>
                    {listofProjectCodes.map(project => <Option key={project.code} value={project.code}>{project.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Project Name" name="project" rules={[{ required: true }]}>
                  <Select showSearch placeholder="Select Project Name" optionFilterProp="children" filterSort={(a, b) => String(a?.children).toLowerCase().localeCompare(String(b?.children).toLowerCase())}>
                    <Option value="">-- All Projects --</Option>
                    {jobsList.map(job => <Option key={job.jobNo} value={job.jobNo}>{job.jobDescription}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Expenditure Type" name="expenditureType" rules={[{ required: true }]}>
                  <Select showSearch placeholder="Select Expenditure Type" optionFilterProp="children" filterSort={(a, b) => String(a?.children).toLowerCase().localeCompare(String(b?.children).toLowerCase())}>
                    <Option value="">-- All Expenditure Types --</Option>
                    {listofExpenditureTypes.map(type => <Option key={type.code} value={type.code}>{type.description}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item label="Activity" name="projectActivity" rules={[{ required: true }]}>
                  <Select showSearch placeholder="Select Activity" optionFilterProp="children" filterSort={(a, b) => String(a?.children).toLowerCase().localeCompare(String(b?.children).toLowerCase())} disabled={!selectedProjectCode}>
                    <Option value="">-- All Activities --</Option>
                    {filteredActivities.map(activity => <Option key={activity.lineNo} value={activity.lineNo}>{activity.planningLineDescription}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              {canViewBudget && (
                <Col span={12}>
                  <Form.Item label="Planned Activity Budget" name="plannedActivityBudget" rules={[{ required: true }]}>
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={val => val == null ? '' : formatCurrencyUSD(Number(val))}
                      parser={val => val ? val.replace(/[^0-9.-]+/g, '') : ''}
                      readOnly
                    />
                  </Form.Item>
                </Col>
              )}

              <Col span={8}>
                <Form.Item
                  label="No of Days"
                  name="noOfDays"
                  rules={[
                    { required: true, message: 'No of days is required' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value == null) return Promise.resolve();
                        if (documentDetails?.noOfDays != null && value > documentDetails.noOfDays) {
                          return Promise.reject(new Error(`No of days should not exceed your applied days which is ${documentDetails.noOfDays} days`));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Input Amount" name="dailyRate">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="Total Amount" name="lineAmount">
                  <InputNumber style={{ width: '100%' }} formatter={val => val == null ? '' : formatCurrencyUSD(Number(val))} />
                </Form.Item>
              </Col>
            </Row>

            {error && <Typography.Text type="danger" style={{ display: 'block', marginTop: 8 }}>{error}</Typography.Text>}

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button onClick={onClose} style={{ marginRight: 8 }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Submit Request Line</Button>
            </div>
          </Form>
        </>
        )}
      </Modal>
    </>
  );
};

export default AdvanceRequestLineModal;
