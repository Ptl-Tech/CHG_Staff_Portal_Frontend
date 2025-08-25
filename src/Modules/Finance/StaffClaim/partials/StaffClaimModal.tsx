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
  Input,
  DatePicker,
  message,
  Skeleton,
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
  ClaimLineData,
  DimensionValues,
  ExpenditureTypes,
  ImprestLineData,
  JobPlanningLines,
  PaymentLinesData,
} from '../../../../types/PaymentData';
import { formatCurrencyUSD } from '../../../../utils/currencyFormmatter';
import { jwtDecode } from 'jwt-decode';
import { selectSubmitImprestLine, submitImprestLine } from '../../../../features/finance/advanceRequisition';
import { fetchImprestLines, fetchPaymentDocumentLines } from '../../../../features/finance/commonRequest';
import { selectSubmitClaimLine, submitClaimLine } from '../../../../features/finance/staffClaim';

const { Option } = Select;

interface RequestLineModalProps {
  visible: boolean;
  onClose: () => void;
  listofExpenditureTypes: ExpenditureTypes[];
  listOfActivities: JobPlanningLines[];
  listofProjectCodes: DimensionValues[];
  initialLine?: PaymentLinesData | null;
  onSave: (line: PaymentLinesData, isEdit: boolean) => void;
}


interface MyPayload {
  staffNo?: string;
  gender?: string;
  given_name?: string;
}

const StaffClaimModal: React.FC<RequestLineModalProps> = ({
  visible,
  onClose,
  listofExpenditureTypes,
  listOfActivities,
  listofProjectCodes,
  initialLine,
  onSave,
}) => {
  const dispatch = useAppDispatch();
  const docNo = new URLSearchParams(window.location.search).get('DocumentNo');

  const donorsList = useAppSelector(selectDonorsList);
  const jobsList = useAppSelector(selectJobsList);
  const status = useAppSelector(selectCommonSetupStatus);
  const error = useAppSelector((state) => state.commonSetup.error);
  const { status: lineSubmitStatus, response: lineSubmitResponse, error: lineSubmitError } = useAppSelector(selectSubmitClaimLine);
  const [form] = Form.useForm();
  useEffect(() => {
    if (initialLine) {
      form.setFieldsValue({
        expenditureDate: moment(initialLine.expenditureDate),
        lineAmount: initialLine.lineAmount,
        projectCode: initialLine.department,
        donorCode: initialLine.projectCode,
        project: initialLine.project,
        projectActivity: initialLine.taskNo,
        expenditureType: initialLine.expenditureType,
        lineDescription: initialLine.lineRemarks,


      });
    } else {
      form.resetFields(); // for create
    }
  }, [initialLine, form]);

  useEffect(() => {
    dispatch(fetchDonorsList());
    dispatch(fetchJobsList());
  }, [dispatch]);
  console.log('initial line', initialLine);
  const selectedProjectCode = Form.useWatch('project', form);
  const selectedActivityId = Form.useWatch('activity', form);
  console.log('selectedActivityId', selectedActivityId);
  console.log('selectedProjectCode', selectedProjectCode);
  const decodedToken = useMemo<MyPayload | null>(() => {
    try {
      const root = localStorage.getItem('persist:root');
      if (!root) return null;

      const parsedRoot = JSON.parse(root);
      const authStr = parsedRoot?.auth;
      if (typeof authStr !== 'string') return null;

      const parsedAuth = JSON.parse(authStr);
      const rawToken = parsedAuth?.token;
      if (typeof rawToken !== 'string') return null;

      return jwtDecode<MyPayload>(rawToken);
    } catch (err) {
      console.warn('Failed to extract/decode JWT from persist:root', err);
      return null;
    }
  }, []);

  const canViewBudget = useMemo(() => {
    if (!decodedToken?.given_name) return false;
    return decodedToken.given_name.toLowerCase() === 'true';
  }, [decodedToken]);


  const filteredActivities = selectedProjectCode
    ? listOfActivities.filter(
      (activity) =>
        activity.jobNo === selectedProjectCode && activity.planningLineDescription !== ''
    )
    : [];

  console.log('filteredActivities', filteredActivities);

  useEffect(() => {
    if (selectedActivityId) {
      const activity = filteredActivities.find(
        (a) => a.lineNo === selectedActivityId
      );
      if (activity) {
        // assume activity.totalAmount is number
        form.setFieldsValue({
          plannedActivityBudget: activity.budgetAmount ?? undefined,
        });
      }
    }
  }, [selectedActivityId, filteredActivities, form]);

  // Watch the two dependent fields
  const amount = Form.useWatch('dailyRate', form);
  const noOfDays = Form.useWatch('noOfDays', form);

  // Keep totalAmount in sync: amount * noOfDays
  useEffect(() => {
    const a = typeof amount === 'number' ? amount : 0;
    const days = typeof noOfDays === 'number' ? noOfDays : 0;
    const computed = a * days;

    // Only set if it differs to avoid unnecessary renders
    const currentTotal = form.getFieldValue('lineAmount') || 0;
    if (computed !== currentTotal) {
      form.setFieldsValue({ totalAmount: computed });
    }
  }, [amount, noOfDays, form]);
  const handleSubmit = async (values: any) => {
    console.log('Submitting line', values);
    // build payload and dispatch
    const payload = {
      documentNo: docNo,
      donorcode: values.donorCode,
      projectCode: values.projectCode,
      projectNo:values.project,
      projectTaskNo:values.projectActivity,
      expenditureType: values.expenditureType,    
      lineDescription: values.lineDescription,
      lineAmount: values.lineAmount,
      expenditureDate: values.expenditureDate.format('YYYY-MM-DD'),
      lineNo: initialLine?.lineNo ?? 0
    };
    onSave(payload, !!initialLine);
    onClose();
    const res = await dispatch(submitClaimLine(payload));
    if (res !== null) {
      const msg = res?.payload?.message || 'Request Line added successfully';
      message.success(msg);
      dispatch(fetchPaymentDocumentLines
        ({ documentNo: docNo }));

      console.log("response", res);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title="Add Request Line"
      footer={null}
      destroyOnClose
      style={{ top: 20 }}
      width={800}
    >
      {lineSubmitStatus === 'pending' ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : lineSubmitError ? (
        <Typography.Text type="danger">{lineSubmitError}</Typography.Text>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            requiredDate: moment(),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Donor Code"
                name="donorCode"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Select Donor Code"
                  optionFilterProp="children"
                  filterSort={(a, b) =>
                    String(a?.children)
                      .toLowerCase()
                      .localeCompare(String(b?.children).toLowerCase())
                  }
                >
                  <Option value="">-- All Donors --</Option>
                  {donorsList.map((donor) => (
                    <Option key={donor.code} value={donor.code}>
                      {donor.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Project Code"
                name="projectCode"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Select Project Code"
                  optionFilterProp="children"
                  filterSort={(a, b) =>
                    String(a?.children)
                      .toLowerCase()
                      .localeCompare(String(b?.children).toLowerCase())
                  }

                >
                  <Option value="">-- All Projects --</Option>
                  {listofProjectCodes?.map((project) => (
                    <Option key={project.code} value={project.code}>
                      {project.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Project Name"
                name="project"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Select Project Name"
                  optionFilterProp="children"
                  filterSort={(a, b) =>
                    String(a?.children)
                      .toLowerCase()
                      .localeCompare(String(b?.children).toLowerCase())
                  }

                >
                  <Option value="">-- All Projects --</Option>
                  {jobsList?.map((job) => (
                    <Option key={job.jobNo} value={job.jobNo}>
                      {job.jobDescription}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Expenditure Date" name="expenditureDate">
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Activity"
                name="projectActivity"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Select Activity"
                  optionFilterProp="children"
                  filterSort={(a, b) =>
                    String(a?.children)
                      .toLowerCase()
                      .localeCompare(String(b?.children).toLowerCase())
                  }
                  disabled={!selectedProjectCode}

                >
                  <Option value="">-- All Activities --</Option>
                  {filteredActivities?.map((activity) => (
                    <Option
                      key={activity.lineNo}
                      value={activity.lineNo}
                    >
                      {activity.planningLineDescription}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>


            {/* only if user is allowed to view budget */}
            {canViewBudget && (
              <Col span={12}>
                <Form.Item
                  label="Planned Activity Budget"
                  name="plannedActivityBudget"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(val) =>
                      val == null ? '' : formatCurrencyUSD(Number(val).valueOf())
                    }
                    parser={(val) => (val ? val.replace(/[^0-9.-]+/g, '') : '')}
                    readOnly
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item
                label="Claim Type"
                name="expenditureType"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Select Expenditure Type"
                  optionFilterProp="children"
                  filterSort={(a, b) =>
                    String(a?.children)
                      .toLowerCase()
                      .localeCompare(String(b?.children).toLowerCase())
                  }
                >
                  <Option value="">-- All Expenditure Types --</Option>
                  {listofExpenditureTypes?.map((expenditureType) => (
                    <Option
                      key={expenditureType.code}
                      value={expenditureType.code}
                    >
                      {expenditureType.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>


            <Col span={12}>
              <Form.Item label="Input Amount" name="lineAmount">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}


                />
              </Form.Item>
            </Col>
            {/* PAYMENT NARRATION */}
            <Col span={24}>
              <Form.Item label="Claim Description (50 characters)" name="lineDescription" 
              rules={[{ required: true , message: 'Claim Description is required' }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>

          </Row>

          {error && (
            <Typography.Text
              type="danger"
              style={{ display: 'block', marginTop: 8 }}
            >
              {error}
            </Typography.Text>
          )}

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit Request Line
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default StaffClaimModal;
