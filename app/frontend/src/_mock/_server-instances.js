// ----------------------------------------------------------------------

const NAMES = [
  'api-server-01',
  'api-server-02',
  'web-server-01',
  'web-server-02',
  'web-server-03',
  'batch-server-01',
  'auth-server-01',
  'gateway-01',
  'gateway-02',
  'db-proxy-01',
  'cache-server-01',
  'queue-worker-01',
  'queue-worker-02',
  'log-collector-01',
  'monitor-server-01',
];

const HOSTS = [
  '10.0.1.10',
  '10.0.1.11',
  '10.0.2.10',
  '10.0.2.11',
  '10.0.2.12',
  '10.0.3.10',
  '10.0.1.20',
  '10.0.4.10',
  '10.0.4.11',
  '10.0.5.10',
  '10.0.6.10',
  '10.0.7.10',
  '10.0.7.11',
  '10.0.8.10',
  '10.0.9.10',
];

const PORTS = [8080, 8080, 443, 443, 443, 8090, 8081, 8443, 8443, 3306, 6379, 5672, 5672, 5044, 9090];

const OS_LIST = [
  'Ubuntu 22.04',
  'Ubuntu 22.04',
  'CentOS 7',
  'CentOS 7',
  'Ubuntu 20.04',
  'Ubuntu 22.04',
  'Rocky Linux 9',
  'Ubuntu 22.04',
  'Ubuntu 22.04',
  'CentOS 7',
  'Ubuntu 20.04',
  'Rocky Linux 9',
  'Rocky Linux 9',
  'Ubuntu 22.04',
  'Ubuntu 20.04',
];

const ENVS = [
  'production',
  'production',
  'production',
  'production',
  'staging',
  'production',
  'production',
  'production',
  'staging',
  'production',
  'production',
  'production',
  'staging',
  'production',
  'development',
];

const TAGS_LIST = [
  ['java', 'spring-boot', 'api'],
  ['java', 'spring-boot', 'api'],
  ['nginx', 'web', 'frontend'],
  ['nginx', 'web', 'frontend'],
  ['nginx', 'web', 'staging'],
  ['java', 'spring-batch'],
  ['java', 'spring-security', 'oauth2'],
  ['kong', 'api-gateway'],
  ['kong', 'api-gateway', 'staging'],
  ['mysql', 'proxy', 'haproxy'],
  ['redis', 'cache'],
  ['rabbitmq', 'worker'],
  ['rabbitmq', 'worker', 'staging'],
  ['filebeat', 'logstash'],
  ['prometheus', 'grafana'],
];

function getStatus(index) {
  // online 70%, warning 20%, offline 10%
  if (index === 4 || index === 12) return 'offline';
  if (index === 3 || index === 9 || index === 11) return 'warning';
  return 'online';
}

function getCpuUsage(index) {
  const status = getStatus(index);
  if (status === 'offline') return 0;
  if (status === 'warning') return 75 + (index * 7) % 20;
  return 15 + (index * 13) % 50;
}

function getMemoryUsage(index) {
  const status = getStatus(index);
  if (status === 'offline') return 0;
  if (status === 'warning') return 80 + (index * 3) % 15;
  return 30 + (index * 11) % 40;
}

function getDiskUsage(index) {
  const status = getStatus(index);
  if (status === 'offline') return 0;
  return 20 + (index * 17) % 60;
}

function getUptimeHours(index) {
  const status = getStatus(index);
  if (status === 'offline') return 0;
  return 24 + (index * 137) % 2160; // 1일 ~ 90일
}

function toISOString(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function toHealthCheckISO(minutesAgo) {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  return d.toISOString();
}

export const _serverInstances = NAMES.map((name, index) => {
  const status = getStatus(index);

  return {
    id: `si-${String(index + 1).padStart(3, '0')}`,
    name,
    host: HOSTS[index],
    port: PORTS[index],
    status,
    os: OS_LIST[index],
    cpuUsage: getCpuUsage(index),
    memoryUsage: getMemoryUsage(index),
    diskUsage: getDiskUsage(index),
    uptimeHours: getUptimeHours(index),
    env: ENVS[index],
    tags: TAGS_LIST[index],
    lastHealthCheck: status === 'offline' ? toHealthCheckISO(120 + index * 30) : toHealthCheckISO(index),
    registeredAt: toISOString(90 + index * 15),
  };
});
