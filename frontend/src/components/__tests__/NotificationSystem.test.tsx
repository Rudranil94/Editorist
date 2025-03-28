import { render, screen, waitFor } from '@testing-library/react';
import { NotificationProvider, NotificationSystem } from '../NotificationSystem';
import { useNotification } from '../../hooks/useNotification';

const renderWithProvider = () => {
  return render(
    <NotificationProvider>
      <TestComponent />
    </NotificationProvider>
  );
};

const TestComponent = () => {
  const { showNotification } = useNotification();
  return (
    <button onClick={() => showNotification.success('Test message')}>
      Show Notification
    </button>
  );
};

describe('NotificationSystem', () => {
  it('renders without notifications initially', () => {
    renderWithProvider();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows success notification', async () => {
    renderWithProvider();
    screen.getByText('Show Notification').click();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Test message');
    });
  });

  it('shows error notification', async () => {
    renderWithProvider();
    const { showNotification } = useNotification();
    showNotification.error('Test error message');
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Test error message');
    });
  });

  it('shows warning notification', async () => {
    renderWithProvider();
    const { showNotification } = useNotification();
    showNotification.warning('Test warning message');
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Test warning message');
    });
  });

  it('shows info notification', async () => {
    renderWithProvider();
    const { showNotification } = useNotification();
    showNotification.info('Test info message');
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Test info message');
    });
  });

  it('auto-dismisses notification after 5 seconds', async () => {
    jest.useFakeTimers();
    renderWithProvider();
    const { showNotification } = useNotification();
    showNotification.info('Test auto-dismiss message');
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    jest.advanceTimersByTime(5000);
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  it('allows manual dismissal of notification', async () => {
    renderWithProvider();
    const { showNotification } = useNotification();
    showNotification.info('Test manual dismiss message');
    await waitFor(() => {
      const notification = screen.getByRole('alert');
      expect(notification).toBeInTheDocument();
      const closeButton = notification.querySelector('button');
      closeButton?.click();
      expect(notification).not.toBeInTheDocument();
    });
  });

  it('stacks multiple notifications', async () => {
    renderWithProvider();
    const { showNotification } = useNotification();
    showNotification.info('First message');
    showNotification.success('Second message');
    showNotification.error('Third message');
    await waitFor(() => {
      const notifications = screen.getAllByRole('alert');
      expect(notifications).toHaveLength(3);
      expect(notifications[0]).toHaveTextContent('First message');
      expect(notifications[1]).toHaveTextContent('Second message');
      expect(notifications[2]).toHaveTextContent('Third message');
    });
  });

  it('removes notifications in correct order', async () => {
    jest.useFakeTimers();
    renderWithProvider();
    const { showNotification } = useNotification();
    showNotification.info('First message', 2000);
    showNotification.success('Second message', 4000);
    await waitFor(() => {
      expect(screen.getAllByRole('alert')).toHaveLength(2);
    });
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      const notifications = screen.getAllByRole('alert');
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toHaveTextContent('Second message');
    });
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  it('handles rapid notification additions', async () => {
    renderWithProvider();
    const { showNotification } = useNotification();
    for (let i = 0; i < 10; i++) {
      showNotification.info(`Message ${i}`);
    }
    await waitFor(() => {
      const notifications = screen.getAllByRole('alert');
      expect(notifications).toHaveLength(10);
      notifications.forEach((notification, index) => {
        expect(notification).toHaveTextContent(`Message ${index}`);
      });
    });
  });
}); 