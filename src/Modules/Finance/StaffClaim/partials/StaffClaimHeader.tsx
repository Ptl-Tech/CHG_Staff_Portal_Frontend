// src/features/leave/LeaveApplicationForm.tsx
import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Select,
  Button,
  Typography,
  Skeleton,
  notification,
} from 'antd';
import { useAppDispatch, useAppSelector } from '../../../../hooks/ReduxHooks';
import {
  fetchClaimDropdownData,
  selectClaimDropdownData,
  selectSubmitClaimRequest,
  submitClaimRequest,
} from '../../../../features/finance/staffClaim';
import type { StaffClaimDTO } from '../../../../types/PaymentData';
import { fetchResponsibilityCenters, selectResponsibilityCenters } from '../../../../features/common/commonSetups';

const { TextArea } = Input;
const { Option } = Select;

interface HeaderProps {
  onSubmit: (newDocNo: string) => void;
}

const StaffClaimHeader: React.FC<HeaderProps> = ({ onSubmit }) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  const {
    allImprestSurrenders,
    allStaffClaimTypes,
    status,
  } = useAppSelector(selectClaimDropdownData);
  const { status: submitStatus, error } = useAppSelector(selectSubmitClaimRequest);
 const { responsibilityCenters, status: destStatus } = useAppSelector(selectResponsibilityCenters);
  const [claimType, setClaimType] = React.useState<string>('');
  const [api, contextHolder] = notification.useNotification();
  useEffect(() => {
    dispatch(fetchClaimDropdownData());
            dispatch(fetchResponsibilityCenters());
    
  }, [dispatch]);

  const SubmitHeader = (values: StaffClaimDTO) => {
    const payLoad = {
      docNo: '',
      claimDescription: values.paymentNarration,
      responsibilityCenter: values.responsibilityCenter,
    };

    dispatch(submitClaimRequest(payLoad))
      .unwrap()
      .then((res) => {
        api.success({
          message: 'Success',
          description: `You have successfully submitted advance request. Document No: ${res.description}`,
          onClose: () => {
            if (res) onSubmit(res.description);
          },
        });
      })
      .catch((error: { message?: string }) => {
        const errorMessage =
          error?.message || 'Failed to submit advance request';
        console.error('Failed to submit advance request', errorMessage);

        api.error({
          message: 'Error',
          description: errorMessage,
        });
      });
  };


  return (
    <div>
      {status === 'pending' || submitStatus === 'pending' ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={SubmitHeader}
          autoComplete="off"
          initialValues={{ claimType: '', documentNumber: '' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              width: '100%',
            }}
          >
            <Typography.Text>
              <strong>
                <u>Claim Header</u>
              </strong>
            </Typography.Text>
          </div>
          {contextHolder}
          <Row gutter={16}>
            {/* <Col span={12}>
              <Form.Item
                label="Claim Type"
                name="claimType"
                rules={[
                  { required: true, message: 'Please select a claim type' },
                ]}
              >
                <Select
                  placeholder="Select Claim Type"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  onChange={(value) => setClaimType(String(value))}
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={allStaffClaimTypes.map((type) => ({
                    label: type.description,
                    value: type.code,
                  }))}
                />
              </Form.Item>
            </Col> */}

            {/* {claimType === '3' && (
              <Col span={12}>
                <Form.Item
                  label="Document Number"
                  name="imprestSurrenderNo"
                  rules={[
                    {
                      required: true,
                      message: 'Please select Imprest Document Number',
                    },
                  ]}
                >
                  <Select
                    placeholder="Select Imprest Document Number"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={allImprestSurrenders.map((plan) => ({
                      label: plan.description,
                      value: plan.code,
                    }))}
                  />
                </Form.Item>
              </Col>
            )} */}

<Col span={12}>
              <Form.Item
                label="Responsibility Center"
                name="responsibilityCenter"
                rules={[{ required: true, message: 'Please enter the responsibility center' }]}
              >
                <Select placeholder="Select Responsibility Center" style={{ width: '100%' }}>
                  {responsibilityCenters.map((center) => (
                    <Option key={center.code} value={center.code}>
                      {center.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Description" name="paymentNarration">
                <TextArea rows={4} />
              </Form.Item>
            </Col>
            
            <Col span={24} style={{ textAlign: 'right' }}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit Claim
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  );
};

export default StaffClaimHeader;
