import dotenv from 'dotenv';
import { container, start } from './di/container';
import { MainService } from './services/runtime.main.service';
import 'reflect-metadata';

dotenv.config();
start();

const mainService = container.get(MainService);
mainService.start('index');
