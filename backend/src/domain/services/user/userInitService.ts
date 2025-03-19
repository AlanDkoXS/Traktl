import { TimerPresetRepository } from '../../repositories/timerPresetRepository.interface';
import { ProjectRepository } from '../../repositories/projectRepository.interface';
import { UserRepository } from '../../repositories/userRepository.interface';
import { UserEntity } from '../../entities/user.entity';
import { ProjectEntity } from '../../entities/project.entity';
import { TimerPresetEntity } from '../../entities/timer-preset.entity';

export class UserInitService {
  constructor(
    private readonly timerPresetRepository: TimerPresetRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {
    console.log('UserInitService constructor called');
  }

  /**
   * Initialize default settings for a new user
   * Creates default projects and timer presets
   */
  async initializeUser(user: UserEntity): Promise<void> {
    try {
      console.log('Initializing user defaults for:', user.email);
      
      // Ensure we have a valid ID
      if (!user.id) {
        console.error('User ID is missing during initialization');
        throw new Error('User ID is required for initialization');
      }

      const userId = user.id;
      console.log(`Starting initialization for user ID: ${userId}`);

      // Create Focus project
      console.log('Creating default Focus project...');
      const focusProject = await this.createDefaultProject(userId);
      console.log('Default Focus project created successfully');

      // Create timer presets
      console.log('Creating default timer presets...');
      const defaultPresets = await this.createDefaultTimerPresets(userId);
      console.log('Default timer presets created:', defaultPresets.length);

      // Set default timer preset (Pomodoro)
      if (defaultPresets.length > 0 && defaultPresets[0].id) {
        console.log('Setting default timer preset:', defaultPresets[0].id);
        await this.setDefaultTimerPreset(userId, defaultPresets[0].id);
        console.log('Default timer preset set successfully');
      } else {
        console.warn('No default presets were created or preset has no ID');
      }

      console.log(`Successfully initialized user: ${user.email}`);
    } catch (error) {
      console.error('Error initializing user:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  /**
   * Create the default "Focus" project for new users
   */
  private async createDefaultProject(userId: string): Promise<ProjectEntity> {
    console.log(`Creating Focus project for user ID: ${userId}`);

    const focusProject = {
      name: 'Focus',
      description: 'Default project for focused work sessions',
      color: '#33d17a',
      user: userId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    } as ProjectEntity;

    try {
      const project = await this.projectRepository.create(focusProject);
      return project;
    } catch (error) {
      console.error('Error creating Focus project:', error);
      throw error;
    }
  }

  /**
   * Create default timer presets for new users
   */
  private async createDefaultTimerPresets(userId: string): Promise<TimerPresetEntity[]> {
    console.log(`Creating default timer presets for user ID: ${userId}`);

    const pomodoroPreset = {
      name: '🍅 Pomodoro',
      workDuration: 25,
      breakDuration: 5,
      repetitions: 4,
      user: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    } as TimerPresetEntity;

    const workBreakPreset = {
      name: '💻 52/17',
      workDuration: 52,
      breakDuration: 17,
      repetitions: 4,
      user: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    } as TimerPresetEntity;

    try {
      console.log('Creating Pomodoro preset...');
      const pomodoro = await this.timerPresetRepository.create(pomodoroPreset);

      console.log('Creating 52/17 preset...');
      const workBreak = await this.timerPresetRepository.create(workBreakPreset);

      return [pomodoro, workBreak];
    } catch (error) {
      console.error('Error creating default timer presets:', error);
      throw error;
    }
  }

  /**
   * Set the default timer preset for a user
   */
  private async setDefaultTimerPreset(userId: string, presetId: string): Promise<void> {
    console.log(`Setting default timer preset ${presetId} for user ID: ${userId}`);

    try {
      // Update user with default timer preset
      const updateResult = await this.userRepository.update(userId, {
        defaultTimerPreset: presetId
      });

      console.log('User update result:', updateResult ? 'success' : 'failed');
    } catch (error) {
      console.error('Error setting default timer preset:', error);
      throw error;
    }
  }
}
